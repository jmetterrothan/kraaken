import { mat3 } from "gl-matrix";

import { Entity, System } from "@src/ECS";
import { Position, Sprite, RigidBody, Camera, BoundingBox, EventZone, Placeable } from "@src/ECS/components";
import { debugSvc } from "@src/shared/services/Debug";
import { DebugFlag } from "@src/enums/DebugFlag";
import { debugOverlay } from "@src/Game";

export class RenderingSystem extends System {
  private entities: Entity[];

  private translationMatrix = mat3.create();
  private offsetMatrix = mat3.create();
  private rotationMatrix = mat3.create();

  private helperTranslationMatrix = mat3.create();
  private helperOffsetMatrix = mat3.create();

  public constructor() {
    super([Position.COMPONENT_TYPE]);

    this.entities = [];
  }

  execute(_delta: number): void {
    const entities = this.world.getEntities(this.componentTypes);

    let n = entities.length,
      r = 0;

    this.entities.length = 0;

    for (let entity of entities) {
      if (!entity.visible) {
        continue;
      }

      if (this.world.isFrustumCulled(entity)) {
        continue;
      }

      r++;

      this.entities.push(entity);
    }

    if (debugSvc.enabled(DebugFlag.STATS)) {
      debugOverlay.moveTo("top_right");
      debugOverlay.line(`Entities = ${n} | Rendered entities = ${r}`);
    }
  }

  render(_alpha: number) {
    const cameraComponent = this.world.camera.getComponent(Camera);

    this.entities.forEach((entity) => {
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
            mat3.fromRotation(this.rotationMatrix, position.rotation);
            mat3.multiply(position.transform, position.transform, this.rotationMatrix);
          }

          /**
           * position is located at the center of the bounding box
           */
          if (entity.hasComponent(BoundingBox.COMPONENT_TYPE)) {
            mat3.fromTranslation(this.translationMatrix, [-bboxWidth / 2, -bboxHeight / 2]);
            mat3.multiply(position.transform, position.transform, this.translationMatrix);
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

          mat3.fromTranslation(this.offsetMatrix, [offsetX, offsetY]);
          mat3.multiply(position.transform, position.transform, this.offsetMatrix);

          position.shouldUpdateTransform = false;
        }

        sprite.render(this.world.projectionMatrix, cameraComponent.viewMatrix, position.transform, rigidBody?.orientation);
      }

      const showZone = entity.hasComponent(EventZone.COMPONENT_TYPE) && debugSvc.enabled(DebugFlag.ZONE_ENTITIES);
      const showPlaceable = entity.hasComponent(Placeable.COMPONENT_TYPE) && debugSvc.enabled(DebugFlag.PLACEABLE_ENTITIES);

      // show bounding box helper
      if (bbox && (showZone || showPlaceable || bbox.debug)) {
        mat3.fromTranslation(this.helperTranslationMatrix, position.toGlArray());
        mat3.fromTranslation(this.helperOffsetMatrix, [-bbox.width / 2, -bbox.height / 2]);
        mat3.multiply(this.helperTranslationMatrix, this.helperTranslationMatrix, this.helperOffsetMatrix);

        bbox.renderHelper(this.world.projectionMatrix, cameraComponent.viewMatrix, this.helperTranslationMatrix);
      }
    });
  }
}
