import Animation from '@src/animation/Animation';

export interface IAnimationFrame {
  row: number;
  col: number;
  duration: number;
};

export interface IAnimationCfg {
  sprite: string;
  loop: boolean;
  keyframes: IAnimationFrame[];
};

export type IAnimationCfgList = {
  [key: string]: IAnimationCfg;
};

export type IAnimationList = {
  [key: string]: Animation;
};