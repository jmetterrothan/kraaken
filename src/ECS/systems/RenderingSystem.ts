import { mat3, vec2 } from "gl-matrix";

import System from "@src/ECS/System";

import { Position, Sprite, RigidBody } from "@src/ECS/components";

import { POSITION_COMPONENT, SPRITE_COMPONENT, RIGID_BODY_COMPONENT } from "@src/ECS/types";

import World from "@src/world/World";

import Vector2 from "@shared/math/Vector2";

export class RenderingSystem extends System {
  public constructor() {
    super([POSITION_COMPONENT, SPRITE_COMPONENT]);
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
        const spriteOffset = new Vector2(-sprite.atlas.tileWidth / 2, -sprite.atlas.tileHeight / 2 - 1);

        position.transform = mat3.fromTranslation(mat3.create(), position.clone().trunc().add(spriteOffset).toGlArray());
        position.shouldUpdateTransform = false;
      }

      sprite.atlas.use();

      sprite.atlas.render(this.world.viewProjectionMatrix, position.transform, sprite.row, sprite.col, rigidBody?.direction, sprite.parameters);
    });
  }
}
