import { mat3 } from "gl-matrix";

import { System } from "@src/ECS";
import { Position, Sprite, RigidBody, Camera, BoundingBox } from "@src/ECS/components";

export class RenderingSystem extends System {
  public constructor() {
    super([
      Position.COMPONENT_TYPE,
      Sprite.COMPONENT_TYPE
    ]);
  }

  execute(alpha: number): void {
    const cameraComponent = this.world.camera.getComponent(Camera);

    const entities = this.world.getEntities(this.componentTypes);

    if (entities.length === 0) {
      return;
    }

    entities.forEach((entity) => {
      if (this.world.isFrustumCulled(entity)) {
        return;
      }

      const sprite = entity.getComponent(Sprite);

      if (!sprite.visible) {
        return;
      }

      const position = entity.getComponent(Position);
      const rigidBody = entity.getComponent(RigidBody);
      const bbox = entity.getComponent(BoundingBox);

      const bboxWidth = bbox?.width ?? 0;
      const bboxHeight = bbox?.height ?? 0;

      let offsetX = 0;
      let offsetY = 0;

      if (sprite.align === "center") {
        offsetX = -(sprite.atlas.tileWidth - bboxWidth) / 2;
        offsetY = -(sprite.atlas.tileHeight - bboxHeight) / 2;
      } else {
        offsetX = -(sprite.atlas.tileWidth - bboxWidth) / 2;
        offsetY = -(sprite.atlas.tileHeight - bboxHeight) + 1; // leaving a gap around of 1px to render the outline correctly
      }
      
      if (position.shouldUpdateTransform) {
        position.transform = mat3.create();

        mat3.fromTranslation(
          position.transform,
          position.clone().toGlArray()
        );

        if (position.rotation !== 0) {
          const r = mat3.fromRotation(mat3.create(), position.rotation);
          mat3.multiply(position.transform, position.transform, r);
        }

        const moveOriginMatrix = mat3.fromTranslation(
          mat3.create(),
          bbox ? [-bbox.width / 2 + offsetX, -bbox.height / 2 + offsetY] : [offsetX, offsetY]
        );

        mat3.multiply(position.transform, position.transform, moveOriginMatrix);

        // fix for texture bleeding by rounding the x, y components
        cameraComponent.viewMatrix[6] = Math.round(cameraComponent.viewMatrix[6]);
        cameraComponent.viewMatrix[7] = Math.round(cameraComponent.viewMatrix[7]);
        position.transform[6] = Math.round(position.transform[6]);
        position.transform[7] = Math.round(position.transform[7]);
        
        position.shouldUpdateTransform = false;
      }
      
      sprite.render(this.world.projectionMatrix, cameraComponent.viewMatrix, position.transform, rigidBody?.orientation);
    });
  }
}
