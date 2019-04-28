import { mat3 } from 'gl-matrix';

import Animation from '@src/animation/Animation';
import Object2d from '@src/objects/Object2d';
import Vector2 from '@src/shared/math/Vector2';
import World from '@src/world/World';

import { IAnimationList } from '@src/shared/models/animation.model';
import { IEntityData } from '@src/shared/models/entity.model';

class AnimatedObject2d extends Object2d {

  get animation(): Animation {
    return this.animationList[this.currentAnimationKey];
  }
  public ghost: boolean;
  protected wireframe: boolean;
  protected flickering: boolean;
  protected direction: Vector2;

  private animationList: IAnimationList;
  private currentAnimationKey: string;
  private previousAnimationKey: string;
  private defaultAnimationKey: string;

  constructor(x: number, y: number, direction: Vector2, data: IEntityData) {
    super(x, y);

    this.wireframe = false;
    this.flickering = false;
    this.direction = direction;
    this.ghost = false;

    // convert animation parameters in Animation objects
    this.defaultAnimationKey = data.defaultAnimationKey;
    this.previousAnimationKey = '';
    this.currentAnimationKey = data.defaultAnimationKey;

    this.animationList = {};

    for (const key of Object.keys(data.animationList)) {
      this.animationList[key] = new Animation(key, data.animationList[key]);
    }

    this.updateModelMatrix();
  }

  public updateAnimation(world: World, delta: number) {
    this.previousAnimationKey = this.currentAnimationKey;
    this.currentAnimationKey = this.updateCurrentAnimationKey();

    if (this.previousAnimationKey !== this.currentAnimationKey) {
      this.shouldUpdateModelMatrix = true;
    }

    this.animation.update();
  }

  public render(viewProjectionMatrix: mat3, alpha: number) {
    super.render(viewProjectionMatrix, alpha);

    if (this.isVisible() && !this.isCulled()) {
      this.animation.render(viewProjectionMatrix, this.modelMatrix, this.direction, this.wireframe, this.flickering, this.ghost);
    }
  }

  protected updateCurrentAnimationKey(): string {
    return this.defaultAnimationKey;
  }

  protected updateModelMatrix() {
    this.modelMatrix = mat3.fromTranslation(mat3.create(), this.getPosition().add(this.animation.getOffset()).toGlArray());
  }
}

export default AnimatedObject2d;
