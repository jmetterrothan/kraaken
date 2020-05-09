import { ANIMATOR_COMPONENT, SPRITE_COMPONENT, PLAYER_MOVEMENT_COMPONENT } from "@src/objects/ECS/types";
import { System, Entity } from "@src/objects/ECS";
import { Animator, Sprite, PlayerMovement } from "@src/objects/ECS/components";

import { CharacterAnimationKeys } from "@shared/models/animation.model";

export class AnimationSystem extends System {
  public constructor() {
    super([ANIMATOR_COMPONENT, SPRITE_COMPONENT]);
  }

  public updateKey(entity: Entity): string {
    const movement = entity.getComponent<PlayerMovement>(PLAYER_MOVEMENT_COMPONENT);
    if (movement) {
      if (movement.falling) {
        return CharacterAnimationKeys.FALLING;
      }
      if (movement.jumping) {
        return CharacterAnimationKeys.JUMPING;
      }
      if (movement.walking) {
        return CharacterAnimationKeys.WALKING;
      }
    }
    return CharacterAnimationKeys.IDLE;
  }

  execute(delta: number): void {
    const entities = this.world.getEntities(this.componentTypes);
    if (entities.length === 0) {
      return;
    }

    entities.forEach((entity) => {
      const animator = entity.getComponent<Animator>(ANIMATOR_COMPONENT);
      const frame = entity.getComponent<Sprite>(SPRITE_COMPONENT);

      const animation = animator.animation;

      animator.previousKey = animator.currentKey;
      animator.currentKey = this.updateKey(entity);

      animation.update();

      frame.row = animation.frame.row;
      frame.col = animation.frame.col;
    });
  }
}
