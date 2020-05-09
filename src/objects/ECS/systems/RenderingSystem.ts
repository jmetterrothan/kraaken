import { vec2, mat3 } from "gl-matrix";

import { Position, Sprite, BoundingBox, RigidBody } from "@src/objects/ECS/components";
import { POSITION_COMPONENT, SPRITE_COMPONENT, BOUNDING_BOX_COMPONENT, RIGID_BODY_COMPONENT } from "@src/objects/ECS/types";
import { System } from "@src/objects/ECS";

import World from "@src/world/World";

export class RenderingSystem extends System {
  public constructor() {
    super([POSITION_COMPONENT, SPRITE_COMPONENT]);
  }

  addedToWorld(world: World): void {
    super.addedToWorld(world);

    world.entityAdded$([SPRITE_COMPONENT]).subscribe((entity) => {
      console.log(entity);
    });

    world.entityRemoved$([SPRITE_COMPONENT]).subscribe((entity) => {
      console.log(entity);
    });
  }

  execute(alpha: number): void {
    const entities = this.world.getEntities(this.componentTypes);
    if (entities.length === 0) {
      return;
    }

    entities.forEach((entity) => {
      if (this.world.isFrustumCulled(entity)) {
        return;
      }

      const position = entity.getComponent<Position>(POSITION_COMPONENT);
      const sprite = entity.getComponent<Sprite>(SPRITE_COMPONENT);
      const rigidBody = entity.getComponent<RigidBody>(RIGID_BODY_COMPONENT);

      if (position.shouldUpdateTransform) {
        position.transform = mat3.fromTranslation(mat3.create(), position.clone().trunc().toGlArray());
        position.shouldUpdateTransform = false;
      }

      let modelMatrix = position.transform;

      if (entity.hasComponent(BOUNDING_BOX_COMPONENT)) {
        const bbox = entity.getComponent<BoundingBox>(BOUNDING_BOX_COMPONENT);
        modelMatrix = mat3.translate(mat3.create(), position.transform, vec2.fromValues(-sprite.atlas.tileWidth / 2, -sprite.atlas.tileHeight / 2 - 1));
      }

      sprite.atlas.use();

      sprite.atlas.render(this.world.viewProjectionMatrix, modelMatrix, sprite.row, sprite.col, rigidBody?.direction, sprite.parameters);
    });
  }
}
