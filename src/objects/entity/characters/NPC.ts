import TileMap from "@src/world/TileMap";
import Character from "@src/objects/entity/Character";
import Object2d from "@src/objects/Object2d";
import Vector2 from "@src/shared/math/Vector2";

import { ICharacter } from "@shared/models/entity.model";

class NPC extends Character {
  private target: Object2d;
  private spawn: Object2d;

  constructor(uuid: string, x: number, y: number, direction: Vector2, data: ICharacter) {
    super(uuid, x, y, direction, data);
    // this.parameters.grayscale = true;
    // this.parameters.alpha = 0.15;

    this.spawn = Object2d.create(x, y);
  }

  public follow(object: Object2d): void {
    this.target = object;
  }

  public unfollow(): void {
    this.target = this.spawn;
  }

  public canSeeObject(map: TileMap, object: Object2d): boolean {
    if (this.target instanceof Object2d) {
      const steps = 32;

      const targetPos = object.getPosition();
      const pos = this.getPosition();

      const d = targetPos.distanceTo(pos);

      if (d > 250) {
        return false;
      }

      const dist = targetPos.clone().sub(pos.clone());
      const v = dist.divideScalar(steps);

      // raycast
      for (let i = 0, n = steps; i < n; i++) {
        const tile = map.getTileAtCoords(pos.x, pos.y);

        if (tile && tile.collision) {
          return false;
        }

        pos.add(v);
      }
    }

    return true;
  }

  public hasTarget(target: Object2d): boolean {
    return this.target === target;
  }

  /*
  public move(world: World, delta: number): void {
    if (this.canSeeObject(world.getTileMap(), world.getPlayer())) {
      this.follow(world.getPlayer());
    } else {
      this.unfollow();
    }

    // this.target instanceof Object2d &&
    if (this.target) {
      const pos = this.getPosition();
      const targetPos = this.target.getPosition();

      // float slightly above the player
      targetPos.y -= 25; // float slightly above the player

      if (this.target instanceof Entity) {
        targetPos.x -= this.target.getDirection().x * 10;
      }

      const dist = pos.sub(targetPos).trunc();

      const left = dist.x > this.acceleration.x;
      const right = dist.x < -this.acceleration.x;
      const top = dist.y > this.acceleration.y;
      const bottom = dist.y < -this.acceleration.y;

      if (left) {
        this.velocity.x -= this.acceleration.x;

        if (this.velocity.x < -this.speed.x) {
          this.velocity.x = -this.speed.x;
        }
      } else if (right) {
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

      if (top) {
        this.velocity.y -= this.acceleration.y;

        if (this.velocity.y < -this.speed.y) {
          this.velocity.y = -this.speed.y;
        }
      } else if (bottom) {
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
  */
}

export default NPC;
