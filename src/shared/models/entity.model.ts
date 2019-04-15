import { IAnimationDataList } from '@src/shared/models/animation.model';

export interface IEntityData {
  defaultState: {
    orientation: {
      x: number;
      y: number;
    },
  };
  animationList: IAnimationDataList;
  defaultAnimationKey: string;
}