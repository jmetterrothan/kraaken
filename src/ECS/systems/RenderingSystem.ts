import { mat3 } from "gl-matrix";

import { System } from "@src/ECS";
import { Position, Sprite, RigidBody, Camera, BoundingBox } from "@src/ECS/components";
import { debugSvc } from "@src/shared/services/Debug";
import { DebugFlag } from "@src/enums/DebugFlag";

export class RenderingSystem extends System {
  public constructor() {
    super([Position.COMPONENT_TYPE]);
  }

  execute(_alpha: number): void {
    const cameraComponent = this.world.camera.getComponent(Camera);

    const entities = this.world.getEntities(this.componentTypes);

    if (entities.length === 0) {
      return;
    }

    entities.forEach((entity) => {
      if (this.world.isFrustumCulled(entity)) {
        return;
      }

      const position = entity.getComponent(Position);
      const bbox = entity.getComponent(BoundingBox);
      const rigidBody = entity.getComponent(RigidBody);

      if (entity.hasComponent(Sprite.COMPONENT_TYPE)) {
        const sprite = entity.getComponent(Sprite);

        if (!sprite.visible) {
          return;
        }

        const bboxWidth = bbox?.width ?? 0;
        const bboxHeight = bbox?.height ?? 0;

        if (position.shouldUpdateTransform) {
          mat3.identity(position.transform);
          mat3.fromTranslation(position.transform, position.toGlArray());

          if (position.rotation !== 0) {
            const r = mat3.fromRotation(mat3.create(), position.rotation);
            mat3.multiply(position.transform, position.transform, r);
          }

          /**
           * position is located at the center of the bounding box
           */
          if (entity.hasComponent(BoundingBox.COMPONENT_TYPE)) {
            const moveOriginMatrix = mat3.fromTranslation(mat3.create(), [-bbox.width / 2, -bbox.height / 2]);

            mat3.multiply(position.transform, position.transform, moveOriginMatrix);
          }

          /**
           * calculate the correct offset to render the sprite at the center of the bounding box
           */
          let offsetX = sprite.offset.x;
          let offsetY = sprite.offset.y;

          if (sprite.align === "center") {
            offsetX += -(sprite.atlas.tileWidth - bboxWidth) / 2;
            offsetY += -(sprite.atlas.tileHeight - bboxHeight) / 2;
          } else {
            offsetX += -(sprite.atlas.tileWidth - bboxWidth) / 2;
            offsetY += -(sprite.atlas.tileHeight - bboxHeight) + 1; // leaving a gap around of 1px to render the outline correctly
          }

          const moveOriginMatrix2 = mat3.fromTranslation(mat3.create(), [offsetX, offsetY]);

          mat3.multiply(position.transform, position.transform, moveOriginMatrix2);

          position.shouldUpdateTransform = false;
        }

        sprite.render(this.world.projectionMatrix, cameraComponent.viewMatrix, position.transform, rigidBody?.orientation);
      }

      // show bounding box helper
      if (bbox && (debugSvc.enabled(DebugFlag.COLLISION) || bbox.debug)) {
        const modelMatrix = mat3.create();

        mat3.fromTranslation(modelMatrix, position.toGlArray());

        const moveOriginMatrix = mat3.fromTranslation(mat3.create(), [-bbox.width / 2, -bbox.height / 2]);

        mat3.multiply(modelMatrix, modelMatrix, moveOriginMatrix);

        bbox.renderHelper(this.world.projectionMatrix, cameraComponent.viewMatrix, modelMatrix);
      }
    });
  }
}
