import { IAnimationDataList } from '@src/shared/models/animation.model';

export interface IEntityData {
  defaultState: {
    direction: {
      x: number;
      y: number;
    },
  };
  animationList: IAnimationDataList;
  defaultAnimationKey: string;
}
