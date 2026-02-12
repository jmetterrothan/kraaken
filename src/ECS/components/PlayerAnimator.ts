import { Entity } from "@src/ECS";
import { Animator, PlayerCombat, Movement, PlayerInput, Health } from "@src/ECS/components";

import World from "@src/world/World";

export enum PlayerAnimationKeys {
  DEAD = "dead",
  HURT = "hurt",
  IDLE = "idle",
  WALKING = "walking",
  FALLING = "falling",
  LANDING = "landing",
  JUMPING = "jumping",
  WALL_CLIMBING = "wallClimbing",
  WALL_SLIDING = "wallSliding",
  USE_PRIMARY_WEAPON = "usePrimaryWeapon",
}

export class PlayerAnimator extends Animator {
  public update(_world: World, entity: Entity): string {
    const movement = entity.getComponent(Movement);
    const combat = entity.getComponent(PlayerCombat);
    const input = entity.getComponent(PlayerInput);
    const health = entity.getComponent(Health);

    if (health.isDead) {
      return `${entity.type}:${PlayerAnimationKeys.DEAD}`;
    }
    if (health.isHit) {
      return `${entity.type}:${PlayerAnimationKeys.HURT}`;
    }
    if (movement.wallClimbing) {
      return `${entity.type}:${PlayerAnimationKeys.WALL_CLIMBING}`;
    }
    if (movement.wallSliding) {
      return `${entity.type}:${PlayerAnimationKeys.WALL_SLIDING}`;
    }
    // vertical movement
    if (movement.landing) {
      return `${entity.type}:${PlayerAnimationKeys.LANDING}`;
    }
    if (movement.falling) {
      return `${entity.type}:${PlayerAnimationKeys.FALLING}`;
    }
    if (movement.jumping) {
      return `${entity.type}:${PlayerAnimationKeys.JUMPING}`;
    }
    // shooting
    if (input && input.attack && combat && combat.attacking) {
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
