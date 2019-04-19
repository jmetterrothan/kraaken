import AnimatedObject2d from '@src/objects/AnimatedObject2d';
import World from '@src/world/World';

class SFX extends AnimatedObject2d {
  public update(world: World, delta: number) {
    super.update(world, delta);

    if (!this.isDirty() && this.animation.playedOnce()) {
      this.setDirty(true);
    }
  }

  public reset() {
    this.animation.reset();
  }
}

export default SFX;
