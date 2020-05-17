import Entity from "@src/ECS/Entity";
import { Animator, PlayerCombat, PlayerMovement, PlayerInput, Health } from "@src/ECS/components";
import { PLAYER_MOVEMENT_COMPONENT, PLAYER_INPUT_COMPONENT, HEALTH_COMPONENT, PLAYER_COMBAT_COMPONENT } from "@src/ECS/types";

export enum PlayerAnimationKeys {
  DEAD = "dead",
  IDLE = "idle",
  WALKING = "walking",
  FALLING = "falling",
  JUMPING = "jumping",
  USE_PRIMARY_WEAPON = "use_primary_weapon",
}

export class PlayerAnimator extends Animator {
  public update(entity: Entity): string {
    const movement = entity.getComponent<PlayerMovement>(PLAYER_MOVEMENT_COMPONENT);
    const combat = entity.getComponent<PlayerCombat>(PLAYER_COMBAT_COMPONENT);
    const input = entity.getComponent<PlayerInput>(PLAYER_INPUT_COMPONENT);
    const health = entity.getComponent<Health>(HEALTH_COMPONENT);

    if (health && health.isDead) {
      return `${entity.type}:${PlayerAnimationKeys.DEAD}`;
    }

    if (input && input.use && combat.weapon.canBeUsed(entity)) {
      return `${entity.type}:${PlayerAnimationKeys.USE_PRIMARY_WEAPON}`;
    }

    if (movement) {
      if (movement.falling) {
        return `${entity.type}:${PlayerAnimationKeys.FALLING}`;
      }
      if (movement.jumping) {
        return `${entity.type}:${PlayerAnimationKeys.JUMPING}`;
      }
      if (movement.walking) {
        return `${entity.type}:${PlayerAnimationKeys.WALKING}`;
      }
    }

    return `${entity.type}:${PlayerAnimationKeys.IDLE}`;
  }
}
