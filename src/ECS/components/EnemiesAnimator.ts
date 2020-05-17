import Entity from "@src/ECS/Entity";
import { Animator, PlayerMovement, Health } from "@src/ECS/components";
import { PLAYER_MOVEMENT_COMPONENT, HEALTH_COMPONENT } from "@src/ECS/types";

export enum EnemyAnimationKeys {
  DEAD = "dead",
  IDLE = "idle",
  WALKING = "walking",
  FALLING = "falling",
}

export class EnemyAnimator extends Animator {
  public update(entity: Entity): string {
    const movement = entity.getComponent<PlayerMovement>(PLAYER_MOVEMENT_COMPONENT);
    const health = entity.getComponent<Health>(HEALTH_COMPONENT);

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
