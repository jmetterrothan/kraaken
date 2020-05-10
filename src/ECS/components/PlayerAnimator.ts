import { Animator, PlayerMovement } from "@src/ECS/components";
import { PLAYER_MOVEMENT_COMPONENT } from "@src/ECS/types";
import { Entity } from "@src/ECS";

import { PlayerAnimationKeys } from "@shared/models/animation.model";

export class PlayerAnimator extends Animator {
  public update(entity: Entity): string {
    const movement = entity.getComponent<PlayerMovement>(PLAYER_MOVEMENT_COMPONENT);
    if (movement) {
      if (movement.falling) {
        return PlayerAnimationKeys.FALLING;
      }
      if (movement.jumping) {
        return PlayerAnimationKeys.JUMPING;
      }
      if (movement.walking) {
        return PlayerAnimationKeys.WALKING;
      }
    }
    return PlayerAnimationKeys.IDLE;
  }
}
