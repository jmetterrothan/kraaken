import Animation from '@src/animation/Animation';
import Object2d from '@src/objects/Object2d';
import Vector2 from '@src/shared/math/Vector2';
import { IAnimationList } from '@src/shared/models/animation.model';
import { IEntityData } from '@src/shared/models/entity.model';
import { mat3 } from 'gl-matrix';

abstract class AnimatedObject2d extends Object2d {
  protected direction: Vector2;

  private animationList: IAnimationList;
  private currentAnimationKey: string;

  constructor(x: number, y: number, data: IEntityData) {
    super(x, y);

    this.direction = new Vector2(
      data.defaultState.direction.x,
      data.defaultState.direction.y,
    );

    // convert animation parameters in Animation objects
    this.currentAnimationKey = data.defaultAnimationKey;
    this.animationList = {};

    for (const key of Object.keys(data.animationList)) {
      this.animationList[key] = new Animation(key, data.animationList[key]);
    }
  }

  public update(delta: number) {
    super.update(delta);

    this.currentAnimationKey = this.updateCurrentAnimationKey();
    this.animationList[this.currentAnimationKey].update();
  }

  public render(viewProjectionMatrix: mat3) {
    this.animationList[this.currentAnimationKey].render(viewProjectionMatrix, this.modelMatrix, this.direction);

    super.render(viewProjectionMatrix);
  }

  protected abstract updateCurrentAnimationKey(): string;
}

export default AnimatedObject2d;
