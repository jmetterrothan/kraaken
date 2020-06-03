import Entity from "@src/ECS/Entity";
import { Animator, PlayerCombat, PlayerMovement, PlayerInput, Health } from "@src/ECS/components";
import { PLAYER_MOVEMENT_COMPONENT, PLAYER_INPUT_COMPONENT, HEALTH_COMPONENT, PLAYER_COMBAT_COMPONENT } from "@src/ECS/types";

import World from "@src/world/World";

export enum PlayerAnimationKeys {
  DEAD = "dead",
  IDLE = "idle",
  WALKING = "walking",
  FALLING = "falling",
  JUMPING = "jumping",
  USE_PRIMARY_WEAPON = "use_primary_weapon",
}

export class PlayerAnimator extends Animator {
  public update(world: World, entity: Entity): string {
    const movement = entity.getComponent<PlayerMovement>(PLAYER_MOVEMENT_COMPONENT);
    const combat = entity.getComponent<PlayerCombat>(PLAYER_COMBAT_COMPONENT);
    const input = entity.getComponent<PlayerInput>(PLAYER_INPUT_COMPONENT);
    const health = entity.getComponent<Health>(HEALTH_COMPONENT);

    if (health.isDead) {
      return `${entity.type}:${PlayerAnimationKeys.DEAD}`;
    }
    // shooting
    if (input.usePrimary && combat.primaryWeapon.canBeUsed(entity)) {
      return `${entity.type}:${PlayerAnimationKeys.USE_PRIMARY_WEAPON}`;
    }
    // vertical movement
    if (movement.falling) {
      return `${entity.type}:${PlayerAnimationKeys.FALLING}`;
    }
    if (movement.jumping) {
      return `${entity.type}:${PlayerAnimationKeys.JUMPING}`;
    }
    // aiming
    if (input.hold && !movement.falling && !movement.jumping && !movement.walking) {
      return `${entity.type}:${PlayerAnimationKeys.USE_PRIMARY_WEAPON}`;
    }
    // walk cycle
    if (movement.walking) {
      return `${entity.type}:${PlayerAnimationKeys.WALKING}`;
    }

    return `${entity.type}:${PlayerAnimationKeys.IDLE}`;
  }
}
