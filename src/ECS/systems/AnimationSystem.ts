import World from "@src/world/World";
import Animation from "@src/animation/Animation";

import { System } from "@src/ECS";
import { Animator, Sprite } from "@src/ECS/components";

export class AnimationSystem extends System {
  public constructor() {
    super([Animator.COMPONENT_TYPE, Sprite.COMPONENT_TYPE]);
  }

  addedToWorld(world: World): void {
    super.addedToWorld(world);

    world.entityAdded$([Animator.COMPONENT_TYPE, Sprite.COMPONENT_TYPE]).subscribe((entity) => {
      const animator = entity.getComponent(Animator);
      const sprite = entity.getComponent(Sprite);

      // sync first frame to the default animation
      const animation = animator.animation;
      sprite.index = sprite.atlas.getIndex(animation.frame.row, animation.frame.col);
    });

    world.entityRemoved$([Animator.COMPONENT_TYPE, Sprite.COMPONENT_TYPE]).subscribe((entity) => {
      const animator = entity.getComponent(Animator);

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
      const animator = entity.getComponent(Animator);
      const sprite = entity.getComponent(Sprite);

      const animation = animator.animation;

      const currentKey = animator.currentKey;
      const nextKey = animator.update(this.world, entity);

      if (nextKey !== currentKey) {
        if (animation.loop || animation.playedOnce) {
          if (!animation.loop) animation.reset();

          animator.previousKey = currentKey;
          animator.currentKey = nextKey;
        }
      }

      animation.update();

      sprite.index = sprite.atlas.getIndex(animation.frame.row, animation.frame.col);
    });
  }
}
