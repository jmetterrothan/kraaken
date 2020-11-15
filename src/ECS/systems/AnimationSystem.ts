import World from "@src/world/World";
import Animation from "@src/animation/Animation";

import { ANIMATOR_COMPONENT, SPRITE_COMPONENT } from "@src/ECS/types";
import System from "@src/ECS/System";
import { Animator, Sprite } from "@src/ECS/components";

export class AnimationSystem extends System {
  public constructor() {
    super([ANIMATOR_COMPONENT, SPRITE_COMPONENT]);
  }

  addedToWorld(world: World): void {
    super.addedToWorld(world);

    world.entityAdded$([ANIMATOR_COMPONENT, SPRITE_COMPONENT]).subscribe((entity) => {
      const animator = entity.getComponent<Animator>(ANIMATOR_COMPONENT);
      const sprite = entity.getComponent<Sprite>(SPRITE_COMPONENT);

      // sync first frame to the default animation
      const animation = animator.animation;
      sprite.row = animation.frame.row;
      sprite.col = animation.frame.col;
    });

    world.entityRemoved$([ANIMATOR_COMPONENT, SPRITE_COMPONENT]).subscribe((entity) => {
      const animator = entity.getComponent<Animator>(ANIMATOR_COMPONENT);

      animator.list.forEach((animation) => {
        Animation.destroy(animation);
      });
    });
  }

  execute(delta: number): void {
    const entities = this.world.getEntities(this.componentTypes);
    if (entities.length === 0) {
      return;
    }

    entities.forEach((entity) => {
      const animator = entity.getComponent<Animator>(ANIMATOR_COMPONENT);
      const sprite = entity.getComponent<Sprite>(SPRITE_COMPONENT);

      const animation = animator.animation;

      animator.previousKey = animator.currentKey;
      animator.currentKey = animator.update(this.world, entity);

      animation.update();

      sprite.row = animation.frame.row;
      sprite.col = animation.frame.col;
    });
  }
}
