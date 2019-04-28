import { IAnimationDataList } from '@src/shared/models/animation.model';

export interface IVector2Data {
  x: number;
  y: number;
}

export interface IEntityData {
  metadata: {
    bbox?: {
      w: number;
      h: number;
    };
  };
  animationList: IAnimationDataList;
  defaultAnimationKey: string;
}

export interface IEntityLevelData {
  key: string;
  spawn: IVector2Data;
  direction: {
    x: number;
    y: number;
  };
}

export interface IMovement {
  move(delta: number): void;
}
