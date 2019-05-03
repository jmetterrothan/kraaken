import { IEntityData } from '@src/shared/models/entity.model';
import World from '@src/world/World';
import { IPlayerData } from './entity.model';

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

export interface IEntityMetadata {
  bbox?: {
    w: number;
    h: number;
  };
}

export interface IPlayerData extends IEntityData {
  speed: IVector2Data;
  acceleration: IVector2Data;
  deceleration: IVector2Data;
  max_jump_height: number;
  jump_speed: number;
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

export interface IMovement {
  move(world: World, delta: number): void;
}
