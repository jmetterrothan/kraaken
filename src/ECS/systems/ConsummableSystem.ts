import { System, Entity } from "@src/ECS";

import { BoundingBox, Position, Consummable, RigidBody } from "@src/ECS/components";

import Vector2 from "@src/shared/math/Vector2";

export class ConsummableSystem extends System {
  public constructor() {
    super([
      Position.COMPONENT_TYPE,
      BoundingBox.COMPONENT_TYPE,
      Consummable.COMPONENT_TYPE
    ]);
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

        const dir = targetPos.clone().sub(position).normalize();

        rigidBody.velocity.x += 40 * dir.x;
        rigidBody.velocity.y += 40 * dir.y;

        if (rigidBody.velocity.x > 160) {
          rigidBody.velocity.x = 160;
        }
        if (rigidBody.velocity.x < -160) {
          rigidBody.velocity.x = -160;
        }
        if (rigidBody.velocity.y > 160) {
          rigidBody.velocity.y = 160;
        }
        if (rigidBody.velocity.y < -160) {
          rigidBody.velocity.y = -160;
        }

        Vector2.destroy(dir);
      }

      this.tryConsummate(entity, targets);
    }
  }
}
