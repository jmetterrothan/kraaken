import { System, Entity } from "@src/ECS";

import { BoundingBox, Position, Consummable, RigidBody, Animator, Fuse } from "@src/ECS/components";

import Vector2 from "@src/shared/math/Vector2";

export class ConsummableSystem extends System {
  public constructor() {
    super([Position.COMPONENT_TYPE, RigidBody.COMPONENT_TYPE, Consummable.COMPONENT_TYPE]);
  }

  tryConsummate(entity: Entity, targets: ReadonlyArray<Entity>): void {
    const consummable = entity.getComponent(Consummable);

    let consummated = false;

    for (const target of targets) {
      if (!consummable.canBeConsummatedBy(target)) {
        continue;
      }

      if (this.isColliding(entity, target)) {
        const position = entity.getComponent(Position);

        consummable.consummatedBy(this.world, target, position);

        if (consummable.limit !== -1 && consummable.nbOfTimesConsummated >= consummable.limit) {
          consummated = true;
        }
      }
    }

    if (consummated) {
      const animator = entity.getComponent(Animator);

      if (!animator || !animator.animation || animator.animation.loop) {
        this.world.removeEntity(entity);
      } else {
        entity.addComponent(new Fuse({ delay: animator.animation.duration, expireAction: "despawn" }));
      }
    }
  }

  public isColliding(entity: Entity, target: Entity) {
    if (entity.hasComponent(BoundingBox.COMPONENT_TYPE)) {
      const targetBbox = target.getComponent(BoundingBox);
      const bbox = entity.getComponent(BoundingBox);

      return targetBbox.intersectBox(bbox);
    }

    return false;
  }

  findNearestEntity(entity: Entity, targets: ReadonlyArray<Entity>): void {
    const consummable = entity.getComponent(Consummable);

    if (!consummable.lockedInNearestEntity) {
      const position = entity.getComponent(Position);

      for (const target of targets) {
        if (!consummable.canBeConsummatedBy(target)) {
          continue;
        }

        const targetPos = target.getComponent(Position);

        if (consummable.attractionRadius > 0) {
          const dist = targetPos.distanceTo(position);

          if (dist < consummable.attractionRadius) {
            consummable.lockedInNearestEntity = target;
            break;
          }
        }
      }
    }
  }

  execute(delta: number): void {
    const entities = this.world.getEntities(this.componentTypes);

    if (entities.length === 0) {
      return;
    }

    for (const entity of entities) {
      const consummable = entity.getComponent(Consummable);

      if (consummable.consummated) {
        continue;
      }

      const targets = this.world.getEntities(consummable.getComponentTypes());

      if (targets.length === 0) {
        continue;
      }

      if (consummable.attractionRadius > 0) {
        this.findNearestEntity(entity, targets);

        if (consummable.lockedInNearestEntity) {
          const position = entity.getComponent(Position);
          const rigidBody = entity.getComponent(RigidBody);

          const targetPos = consummable.lockedInNearestEntity.getComponent(Position);

          const toTarget = targetPos.clone().sub(position);
          const dist = toTarget.length();
          const dir = toTarget.normalize();

          const maxSpeed = Math.min(consummable.speed, dist * consummable.snappiness); // 6 is tuning: bigger = snappier
          // steer velocity toward desired velocity
          const desiredVx = dir.x * maxSpeed;
          const desiredVy = dir.y * maxSpeed;

          const maxDv = consummable.acceleration * delta;
          const dvx = desiredVx - rigidBody.velocity.x;
          const dvy = desiredVy - rigidBody.velocity.y;
          const dv = Math.hypot(dvx, dvy);

          if (dv > maxDv) {
            // take only a small step toward wanted velocity
            const s = maxDv / dv;
            rigidBody.velocity.x += dvx * s;
            rigidBody.velocity.y += dvy * s;
          } else {
            // close enough: snap to wanted velocity
            rigidBody.velocity.x = desiredVx;
            rigidBody.velocity.y = desiredVy;
          }

          Vector2.destroy(toTarget);
        }
      }

      this.tryConsummate(entity, targets);
    }
  }
}
