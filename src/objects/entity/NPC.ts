import { mat3 } from "gl-matrix";

import Entity from "@src/objects/entity/Entity";
import Vector2 from "@src/shared/math/Vector2";
import World from "@src/world/World";

import { IEntityData } from "@shared/models/entity.model";

class NPC extends Entity {
  constructor(x: number, y: number, direction: Vector2, data: IEntityData) {
    super(x, y, direction, data);
    this.parameters.grayscale = true;
    this.parameters.alpha = 0.15;
  }

  public move(world: World, delta: number): void {
    const target = world.getPlayer().getPosition();

    target.y -= Math.sin(window.performance.now() / 500) * 5; // floating anim
    target.y -= 35; // float slightly above the player

    this.setPositionFromVector2(this.getPosition().lerp(target, 0.085));

    this.parameters.direction.x = world.getPlayer().getDirection().x * -1;
  }

  protected updateModelMatrix() {
    const offset = this.animation.getOffset();

    // correction accounting for bbox beeing at the bottom of the tile
    if (this.bbox) {
      offset.y -= (this.animation.getHeight() - this.bbox.getHeight()) / 2;
    }

    this.modelMatrix = mat3.fromTranslation(
      mat3.create(),
      this.getPosition()
        .add(offset)
        .toGlArray()
    );
  }
}

export default NPC;
