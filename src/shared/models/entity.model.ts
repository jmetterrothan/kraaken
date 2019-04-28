import World from '@src/world/World';

import { IAnimationDataList } from '@src/shared/models/animation.model';
import { IVector2Data } from '@src/shared/models/math.model';

export interface IMetadata {
  [key: string]: any;
}

export interface IEntityData {
  metadata: IEntityMetadata;
  animationList: IAnimationDataList;
  defaultAnimationKey: string;
}

export interface ILootData {
  metadata: IMetadata;
  ref: string;
}

export interface IObjectLevelData {
  debug: boolean;
  ref: string;
  spawn: IVector2Data;
  direction: IVector2Data;
}

export interface IEntityMetadata {
  bbox?: {
    w: number;
    h: number;
  };
}

export interface IMovement {
  move(world: World, delta: number): void;
}
