import { System, Entity } from "@src/ECS";

import { BoundingBox, Position, Consummable, RigidBody } from "@src/ECS/components";

import Vector2 from "@src/shared/math/Vector2";

export class ConsummableSystem extends System {
  public constructor() {
    super([Position.COMPONENT_TYPE, BoundingBox.COMPONENT_TYPE, RigidBody.COMPONENT_TYPE, Consummable.COMPONENT_TYPE]);
  }

  tryConsummate(entity: Entity, targets: ReadonlyArray<Entity>): void {
    const consummable = entity.getComponent(Consummable);
    const bbox = entity.getComponent(BoundingBox);

    for (const target of targets) {
      if (!consummable.canBeConsummatedBy(target)) {
        continue;
      }

      const targetBbox = target.getComponent(BoundingBox);

      if (targetBbox.intersectBox(bbox)) {
        const position = entity.getComponent(Position);
        consummable.consummatedBy(this.world, target);

        if (consummable.pickUpVFX) {
          this.world.playEffectOnceAt(consummable.pickUpVFX, { x: position.x, y: position.y });
        }

        if (consummable.limit !== -1 && consummable.nbOfTimesConsummated >= consummable.limit) {
          consummable.consummated = true;
          this.world.removeEntity(entity);
        }

        break;
      }
    }
  }

  findTarget(entity: Entity, targets: ReadonlyArray<Entity>): void {
    const consummable = entity.getComponent(Consummable);

    if (consummable.target) {
      return;
    }

    const position = entity.getComponent(Position);

    for (const target of targets) {
      if (!consummable.canBeConsummatedBy(target)) {
        continue;
      }

      const targetPos = target.getComponent(Position);

      if (consummable.radius > 0 && !consummable.target) {
        const dist = targetPos.distanceTo(position);

        if (dist < consummable.radius) {
          consummable.target = target;
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

      if (consummable.radius > 0) {
        this.findTarget(entity, targets);
      }

      if (consummable.target) {
        const position = entity.getComponent(Position);
        const rigidBody = entity.getComponent(RigidBody);

        const targetPos = consummable.target.getComponent(Position);

        const acceleration = 400;
        const speed = 160;
        const snappiness = 6;

        const toTarget = targetPos.clone().sub(position);
        const dist = toTarget.length();
        const dir = toTarget.normalize();

        const maxSpeed = Math.min(speed, dist * snappiness); // 6 is tuning: bigger = snappier
        // steer velocity toward desired velocity
        const desiredVx = dir.x * maxSpeed;
        const desiredVy = dir.y * maxSpeed;

        const maxDv = acceleration * delta;
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

      this.tryConsummate(entity, targets);
    }
  }
}
