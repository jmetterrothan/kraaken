import World from "@src/world/World";

import { IAnimationList } from "@src/shared/models/animation.model";
import { IVector2 } from "@src/shared/models/math.model";

export interface IMovement {
  move(world: World, delta: number): void;
}

export interface IMetadata {
  [key: string]: any;
}

export interface IObject {
  ref: string;
  metadata: IMetadata;
  animationList: IAnimationList;
  defaultAnimationKey: string;
}

export interface IEntity extends IObject {
  metadata: {
    bbox: {
      w: number;
      h: number;
    };
  };
}

export interface IPlayer extends IObject {
  metadata: {
    bbox: {
      w: number;
      h: number;
    };
    speed: IVector2;
    acceleration: IVector2;
    deceleration: IVector2;
    max_jump_height: number;
    jump_speed: number;
  };
}

export interface ILoot extends IObject {
  metadata: {
    sfx: string;
  };
}
