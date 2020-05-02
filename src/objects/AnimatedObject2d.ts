import { mat3 } from "gl-matrix";

import Animation from "@src/animation/Animation";
import Object2d from "@src/objects/Object2d";
import Vector2 from "@src/shared/math/Vector2";

import { ISpriteRenderParameters } from "@shared/models/animation.model";
import { IObject } from "@src/shared/models/entity.model";

class AnimatedObject2d extends Object2d {
  public get animation(): Animation {
    return this.animationList[this.currentAnimationKey];
  }

  protected parameters: ISpriteRenderParameters;

  private animationList: Record<string, Animation>;
  private currentAnimationKey: string;
  private previousAnimationKey: string;
  private defaultAnimationKey: string;

  constructor(uuid: string, x: number, y: number, direction: Vector2, data: IObject) {
    super(uuid, x, y);

    this.parameters = {
      direction,
      wireframe: false,
      grayscale: false,
      flickering: false,
      alpha: 1,
    };

    // convert animation parameters in Animation objects
    this.defaultAnimationKey = data.defaultAnimationKey;
    this.previousAnimationKey = "";
    this.currentAnimationKey = data.defaultAnimationKey;

    this.animationList = {};

    for (const key of Object.keys(data.animationList)) {
      this.animationList[key] = new Animation(key, data.animationList[key]);
    }

    this.updateModelMatrix();
  }

  public updateAnimation() {
    this.previousAnimationKey = this.currentAnimationKey;
    this.currentAnimationKey = this.updateCurrentAnimationKey();

    if (this.previousAnimationKey !== this.currentAnimationKey) {
      this.shouldUpdateModelMatrix = true;
    }

    if (this.animation) {
      this.animation.update();
    }
  }

  public render(viewProjectionMatrix: mat3, alpha: number) {
    super.render(viewProjectionMatrix, alpha);

    if (this.isVisible() && !this.isCulled() && this.animation) {
      this.animation.render(viewProjectionMatrix, this.modelMatrix, this.parameters);
    }
  }

  protected updateCurrentAnimationKey(): string {
    return this.defaultAnimationKey;
  }

  protected updateModelMatrix() {
    this.modelMatrix = mat3.fromTranslation(mat3.create(), this.getPosition().add(this.animation.getOffset()).trunc().toGlArray());
  }
}

export default AnimatedObject2d;
