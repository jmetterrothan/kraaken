import Animation from '@src/animation/Animation';

export interface IAnimationFrame {
  row: number;
  col: number;
  duration: number;
}

export interface IAnimationData {
  sprite: string;
  loop: boolean;
  keyframes: IAnimationFrame[];
}

export interface IAnimationDataList {
  [key: string]: IAnimationData;
}

export interface IAnimationList {
  [key: string]: Animation;
}

export enum CharacterAnimationKeys {
  idle = 'idle',
  walking = 'walking',
}
