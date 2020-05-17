import System from "@src/ECS/System";
import Entity from "@src/ECS/Entity";

import { POSITION_COMPONENT, BOUNDING_BOX_COMPONENT, CONSUMMABLE_COMPONENT, RIGID_BODY_COMPONENT } from "@src/ECS/types";
import { BoundingBox, Position, Consummable, RigidBody } from "@src/ECS/components";

export class ConsummableSystem extends System {
  public constructor() {
    super([POSITION_COMPONENT, BOUNDING_BOX_COMPONENT, CONSUMMABLE_COMPONENT]);
  }

  tryConsummate(entity: Entity, targets: ReadonlyArray<Entity>) {
    const consummable = entity.getComponent<Consummable>(CONSUMMABLE_COMPONENT);
    const bbox = entity.getComponent<BoundingBox>(BOUNDING_BOX_COMPONENT);

    for (const target of targets) {
      if (!consummable.canBeConsummatedBy(target)) {
        continue;
      }

      const targetBbox = target.getComponent<BoundingBox>(BOUNDING_BOX_COMPONENT);

      if (targetBbox.intersectBox(bbox)) {
        const position = entity.getComponent<Position>(POSITION_COMPONENT);

        consummable.consummatedBy(this.world, target);
        consummable.consummated = true;

        if (consummable.vfx) {
          this.world.playEffectOnceAt(consummable.vfx, { x: position.x, y: position.y });
        }

        this.world.removeEntity(entity);
      }
    }
  }

  findTarget(entity: Entity, targets: ReadonlyArray<Entity>) {
    const consummable = entity.getComponent<Consummable>(CONSUMMABLE_COMPONENT);

    if (consummable.target) {
      return;
    }

    const position = entity.getComponent<Position>(POSITION_COMPONENT);

    for (const target of targets) {
      if (!consummable.canBeConsummatedBy(target)) {
        continue;
      }

      const targetPos = target.getComponent<Position>(POSITION_COMPONENT);

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
      const consummable = entity.getComponent<Consummable>(CONSUMMABLE_COMPONENT);

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
        const position = entity.getComponent<Position>(POSITION_COMPONENT);
        const rigidBody = entity.getComponent<RigidBody>(RIGID_BODY_COMPONENT);

        const targetPos = consummable.target.getComponent<Position>(POSITION_COMPONENT);

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
      }

      this.tryConsummate(entity, targets);
    }
  }
}
