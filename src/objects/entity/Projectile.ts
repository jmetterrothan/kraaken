import Tile from "@src/world/Tile";
import TileMap from "@src/world/TileMap";
import SFX from "@src/objects/sfx/SFX";
import Vector2 from "@shared/math/Vector2";
import Entity from "@src/objects/entity/Entity";
import World from "@src/world/World";

import { IEntity, IMovement } from "@shared/models/entity.model";
import { ProjectileAnimationKeys } from "@src/shared/models/animation.model";

import { uuid } from "@src/shared/utility/Utility";

class Projectile extends Entity implements IMovement {
  protected damage: number;
  protected speed: Vector2;
  protected hasCollidedWithEntity: boolean;

  constructor(x: number, y: number, direction: Vector2, data: IEntity) {
    super(uuid(), x, y, direction, data);

    this.speed = new Vector2(data.metadata.speed.x || 0, data.metadata.speed.y || 0);
    this.damage = data.metadata.damage;

    this.hasCollidedWithEntity = false;

    setTimeout(() => {
      this.setDirty(true);
    }, 1000);
  }

  public move(world: World, delta: number): void {
    if (!this.hasCollidedWithEntity) {
      this.velocity.x = this.getDirection().getX() * this.speed.x * delta;
      this.velocity.y = this.getDirection().getY() * this.speed.y * delta;
    } else {
      this.velocity.x = 0;
      this.velocity.y = 0;
    }

    super.move(world, delta);
  }

  public collidedWithMap(tile: Tile) {
    this.hasCollidedWithEntity = true;
  }

  public handleCollisions(map: TileMap, delta: number) {
    const velocity = this.velocity.clone().multiplyScalar(delta);
    const newPosition = this.getPosition().add(velocity);

    if (this.collide) {
      const x = this.getX();
      const y = this.getY();

      const tileY = map.getTileAtCoords(x, y + velocity.y);
      if (tileY && tileY.collision) {
        if (velocity.y > 0) {
          // bottom collision
          newPosition.y = tileY.position.y - 0.01;
          this.velocity.y = 0;
          this.collidedWithMap(tileY);
        } else if (velocity.y < 0) {
          // top collision
          newPosition.y = tileY.position.y + map.getTileSize() + 0.01;
          this.velocity.y = 0;
          this.collidedWithMap(tileY);
        }
      }

      const tileX = map.getTileAtCoords(x + velocity.x, y);
      if (tileX && tileX.collision) {
        if (velocity.x > 0) {
          // right collision
          newPosition.x = tileX.position.x - 0.001;
          this.velocity.x = 0;
          this.collidedWithMap(tileX);
        } else if (velocity.x < 0) {
          // left collision
          newPosition.x = tileX.position.x + map.getTileSize() + 0.01;
          this.velocity.x = 0;
          this.collidedWithMap(tileX);
        }
      }
    }

    this.setPositionFromVector2(newPosition);
  }

  public update(world: World, delta: number) {
    super.update(world, delta);

    if (!this.hasCollidedWithEntity) {
      const entities = world.getActiveEntities();

      for (const entity of entities) {
        if (!(entity instanceof Entity) || !this.canCollideWith(entity)) {
          continue;
        }

        if (entity.collideWith(this)) {
          this.collidedWith(entity);
          break;
        }
      }
    }
  }

  public canCollideWith(entity: Entity): boolean {
    return this !== entity && !(entity instanceof Projectile);
  }

  public collidedWith(entity: Entity) {
    this.hasCollidedWithEntity = true;

    entity.setHealth(entity.getHealth() - this.damage);
  }

  protected updateCurrentAnimationKey(): string {
    if (this.hasCollidedWithEntity) {
      return ProjectileAnimationKeys.HIT;
    }
    return ProjectileAnimationKeys.DEFAULT;
  }
}

export default Projectile;
