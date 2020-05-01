import Vector2 from "@shared/math/Vector2";
import Entity from "@src/objects/entity/Entity";
import World from "@src/world/World";

import { IEntity, IMovement } from "@shared/models/entity.model";
import { ProjectileAnimationKeys } from "@src/shared/models/animation.model";

import { uuid } from "@src/shared/utility/Utility";

class Projectile extends Entity implements IMovement {
  protected speed: Vector2;
  protected hasCollidedWithEntity: boolean;

  constructor(x: number, y: number, direction: Vector2, data: IEntity) {
    super(uuid(), x, y, direction, data);

    this.speed = new Vector2(data.metadata.speed.x || 0, data.metadata.speed.y || 0);
    this.hasCollidedWithEntity = false;

    setTimeout(() => {
      this.setDirty(true);
    }, 2000);
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

    console.log("hit");

    // this.setVisible(false);
    // this.setDirty(true);
  }

  protected updateCurrentAnimationKey(): string {
    if (this.hasCollidedWithEntity) {
      return ProjectileAnimationKeys.HIT;
    }
    return ProjectileAnimationKeys.DEFAULT;
  }
}

export default Projectile;
