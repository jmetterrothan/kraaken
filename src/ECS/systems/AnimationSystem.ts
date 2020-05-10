import { ANIMATOR_COMPONENT, SPRITE_COMPONENT } from "@src/ECS/types";
import System from "@src/ECS/System";
import { Animator, Sprite } from "@src/ECS/components";

export class AnimationSystem extends System {
  public constructor() {
    super([ANIMATOR_COMPONENT, SPRITE_COMPONENT]);
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
      animator.currentKey = animator.update(entity);

      animation.update();

      frame.row = animation.frame.row;
      frame.col = animation.frame.col;
    });
  }
}
