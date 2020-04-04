import { mat3 } from "gl-matrix";

import Entity from "@src/objects/entity/Entity";
import Object2d from "@src/objects/Object2d";
import Vector2 from "@src/shared/math/Vector2";
import World from "@src/world/World";

import { IEntityData } from "@shared/models/entity.model";

class NPC extends Entity {
  protected acceleration: Vector2;
  protected deceleration: Vector2;
  protected speed: Vector2;

  private target: Object2d;
  private spawn: Object2d;

  constructor(x: number, y: number, direction: Vector2, data: IEntityData) {
    super(x, y, direction, data);
    // this.parameters.grayscale = true;
    // this.parameters.alpha = 0.15;

    this.acceleration = new Vector2(4, 4);
    this.deceleration = new Vector2(4, 4);
    this.speed = new Vector2(40, 40);

    this.spawn = new Object2d(x, y);
  }

  public follow(object: Object2d): void {
    this.target = object;
  }

  public unfollow(): void {
    this.target = this.spawn;
  }

  public hasTarget(target: Object2d): boolean {
    return this.target === target;
  }

  public move(world: World, delta: number): void {
    if (this.target instanceof Object2d) {
      const pos = this.getPosition();
      const targetPos = this.target.getPosition();

      // float slightly above the player
      targetPos.y -= 25; // float slightly above the player

      if (this.target instanceof Entity) {
        targetPos.x -= this.target.getDirection().x * 10;
      }

      const dist = pos.sub(targetPos).trunc();

      if (dist.x > this.acceleration.x) {
        this.velocity.x -= this.acceleration.x;

        if (this.velocity.x < -this.speed.x) {
          this.velocity.x = -this.speed.x;
        }
      } else if (dist.x < -this.acceleration.x) {
        this.velocity.x += this.acceleration.x;

        if (this.velocity.x > this.speed.x) {
          this.velocity.x = this.speed.x;
        }
      } else {
        if (this.velocity.x > 0) {
          this.velocity.x -= this.deceleration.x;
          if (this.velocity.x < 0) {
            this.velocity.x = 0;
          }
        }
        if (this.velocity.x < 0) {
          this.velocity.x += this.deceleration.x;
          if (this.velocity.x > 0) {
            this.velocity.x = 0;
          }
        }
      }

      if (dist.y > this.acceleration.y) {
        this.velocity.y -= this.acceleration.y;

        if (this.velocity.y < -this.speed.y) {
          this.velocity.y = -this.speed.y;
        }
      } else if (dist.y < -this.acceleration.y) {
        this.velocity.y += this.acceleration.y;

        if (this.velocity.y > this.speed.y) {
          this.velocity.y = this.speed.y;
        }
      } else {
        if (this.velocity.y > 0) {
          this.velocity.y -= this.deceleration.y;
          if (this.velocity.y < 0) {
            this.velocity.y = 0;
          }
        }
        if (this.velocity.y < 0) {
          this.velocity.y += this.deceleration.y;
          if (this.velocity.y > 0) {
            this.velocity.y = 0;
          }
        }
      }

      if (this.target instanceof Entity) {
        this.parameters.direction.x = this.target.getDirection().x;
      }

      // this.velocity.add(world.getGravity());
    } else {
      if (this.velocity.x > 0) {
        this.velocity.x -= this.deceleration.x;
        if (this.velocity.x < 0) {
          this.velocity.x = 0;
        }
      }
      if (this.velocity.x < 0) {
        this.velocity.x += this.deceleration.x;
        if (this.velocity.x > 0) {
          this.velocity.x = 0;
        }
      }

      if (this.velocity.y > 0) {
        this.velocity.y -= this.deceleration.y;
        if (this.velocity.y < 0) {
          this.velocity.y = 0;
        }
      }
      if (this.velocity.y < 0) {
        this.velocity.y += this.deceleration.y;
        if (this.velocity.y > 0) {
          this.velocity.y = 0;
        }
      }
    }
  }

  protected updateModelMatrix() {
    const offset = this.animation.getOffset();

    // correction accounting for bbox beeing at the bottom of the tile
    /*
    if (this.bbox) {
      offset.y -= (this.animation.getHeight() - this.bbox.getHeight()) / 2;
    }*/

    this.modelMatrix = mat3.fromTranslation(
      mat3.create(),
      this.getPosition().add(offset).trunc().toGlArray()
    );
  }
}

export default NPC;
