import { Entity, System } from "@src/ECS";
import { RigidBody, FlyingAI, Position, FlyingAIBehavior, Health } from "@src/ECS/components";

import Vector2 from "@src/shared/math/Vector2";

export class FlyingAISystem extends System {
  public constructor() {
    super([FlyingAI.COMPONENT_TYPE, Position.COMPONENT_TYPE, RigidBody.COMPONENT_TYPE]);
  }

  acquireTargetPosition(entity: Entity): Vector2 | null {
    const ai = entity.getComponent(FlyingAI);

    if (ai.target && ai.isSeeingTarget) {
      if (!ai.target.hasComponent(Health.COMPONENT_TYPE) || ai.target.getComponent(Health).isAlive) {
        return ai.target.getComponent(Position) as Vector2;
      }
    }

    return ai.homePos;
  }

  execute(delta: number): void {
    const entities = this.world.getEntities(this.componentTypes);
    if (entities.length === 0) {
      return;
    }

    const now = window.performance.now();

    entities.forEach((entity) => {
      const ai = entity.getComponent(FlyingAI);
      const health = entity.getComponent(Health);

      const position = entity.getComponent(Position);

      if (health && health.isDead) {
        return;
      }

      if (ai.homePos === null) {
        ai.homePos = position.clone();
      }

      if (!ai.target) {
        ai.follow(this.world.player);
        return;
      }

      const rigidBody = entity.getComponent(RigidBody);

      if (now - ai.lastVisionCheck > 150) {
        ai.isSeeingTarget = ai.canSeeObject(this.world, entity);
        ai.lastVisionCheck = now;
      }

      const targetPos = this.acquireTargetPosition(entity);

      if (!targetPos) {
        return;
      }

      const dx = targetPos.x - position.x;

      if (Math.abs(rigidBody.velocity.x) > 0.01) {
        rigidBody.orientation.x = rigidBody.velocity.x > 0 ? 1 : -1;
        rigidBody.direction.x = rigidBody.orientation.x;
      }

      const dy = targetPos.y - position.y;
      const dist = Math.hypot(dx, dy);
      const inv = dist > 0 ? 1 / dist : 0;
      const dirX = dx * inv;
      const dirY = dy * inv;

      if (ai.behavior === FlyingAIBehavior.SEEK) {
        // accelerate toward target until within stopRadius, then decelerate to 0
        if (dist >= ai.stopRadius) {
          rigidBody.velocity.x += ai.acceleration * dirX * delta;
          rigidBody.velocity.y += ai.acceleration * dirY * delta;
        } else {
          const step = ai.deceleration * delta;
          // approach 0 on x
          if (rigidBody.velocity.x > 0) rigidBody.velocity.x = Math.max(0, rigidBody.velocity.x - step);
          else if (rigidBody.velocity.x < 0) rigidBody.velocity.x = Math.min(0, rigidBody.velocity.x + step);
          // approach 0 on y
          if (rigidBody.velocity.y > 0) rigidBody.velocity.y = Math.max(0, rigidBody.velocity.y - step);
          else if (rigidBody.velocity.y < 0) rigidBody.velocity.y = Math.min(0, rigidBody.velocity.y + step);
        }
      } else {
        rigidBody.orientation.x = dx > 0 ? 1 : -1;
        rigidBody.direction.x = dx > 0 ? 1 : -1;
      }

      // clamp velocity by magnitude
      const v = Math.hypot(rigidBody.velocity.x, rigidBody.velocity.y);
      if (v > ai.speed) {
        const s = ai.speed / v;
        rigidBody.velocity.x *= s;
        rigidBody.velocity.y *= s;
      }
    });
  }
}
