import { Entity } from "@src/ECS";
import { Animator, PlayerCombat, PlayerMovement, PlayerInput, Health } from "@src/ECS/components";

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
    const movement = entity.getComponent(PlayerMovement);
    const combat = entity.getComponent(PlayerCombat);
    const input = entity.getComponent(PlayerInput);
    const health = entity.getComponent(Health);

    if (health.isDead) {
      return `${entity.type}:${PlayerAnimationKeys.DEAD}`;
    }
    // shooting
    if (input.usePrimary && combat.primaryWeapon.canBeUsed(world, entity)) {
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

  public toString(): string {
    return PlayerAnimator.COMPONENT_TYPE;
  }
}
