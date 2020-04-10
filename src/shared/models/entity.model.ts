import World from "@src/world/World";

import { IAnimationList } from "@src/shared/models/animation.model";
import { IVector2 } from "@src/shared/models/math.model";

export interface IMetadata {
  [key: string]: any;
}

export interface IEntity {
  metadata: IEntityMetadata;
  animationList: IAnimationList;
  defaultAnimationKey: string;
}

export interface IEntityMetadata {
  bbox?: {
    w: number;
    h: number;
  };
}

export interface IPlayer extends IEntity {
  speed: IVector2;
  acceleration: IVector2;
  deceleration: IVector2;
  max_jump_height: number;
  jump_speed: number;
}

export interface ILoot {
  metadata: IMetadata;
  ref: string;
}

export interface IMovement {
  move(world: World, delta: number): void;
}
