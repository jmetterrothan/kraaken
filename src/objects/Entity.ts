import { mat3, vec2 } from "gl-matrix";

import Animation from '@src/animation/Animation';
import Object2d from '@src/objects/Object2d';

import { IAnimationCfgList, IAnimationList } from "@src/shared/models/animation.model";

interface IEntityData {
  animationList: IAnimationCfgList;
  defaultAnimationKey: string;
};

class Entity extends Object2d {
  private animationList: IAnimationList;
  private currentAnimationKey: string;

  protected orientation: vec2;

  constructor(x: number, y: number, data: IEntityData) {
    super(x, y);

    // convert animation parameters in Animation objects
    this.currentAnimationKey = data.defaultAnimationKey;
    this.animationList = {};

    for(const key of Object.keys(data.animationList)) {
      this.animationList[key] = new Animation(key, data.animationList[key]);
    }

    this.orientation = vec2.fromValues(1, 1);
  }

  update(delta: number) {
    this.currentAnimation.update();
    super.update(delta);
  }

  render(viewProjectionMatrix: mat3) {
    this.currentAnimation.render(viewProjectionMatrix, this.modelMatrix, this.orientation);
  }

  get currentAnimation(): Animation {
    return this.animationList[this.currentAnimationKey];
  }
}

export default Entity;