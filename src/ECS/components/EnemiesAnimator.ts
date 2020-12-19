import World from "@src/world/World";

import { Entity } from "@src/ECS";
import { Animator, Movement, Health } from "@src/ECS/components";

export enum EnemyAnimationKeys {
  DEAD = "dead",
  IDLE = "idle",
  WALKING = "walking",
  FALLING = "falling",
}

export class EnemyAnimator extends Animator {
  public update(world: World, entity: Entity): string {
    const movement = entity.getComponent(Movement);
    const health = entity.getComponent(Health);

    if (health && health.isDead) {
      return `${entity.type}:${EnemyAnimationKeys.DEAD}`;
    }

    if (movement) {
      if (movement.falling) {
        return `${entity.type}:${EnemyAnimationKeys.FALLING}`;
      }
      if (movement.walking) {
        return `${entity.type}:${EnemyAnimationKeys.WALKING}`;
      }
    }

    return `${entity.type}:${EnemyAnimationKeys.IDLE}`;
  }
}
