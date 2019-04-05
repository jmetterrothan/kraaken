export interface IAnimationFrame {
  row: number;
  col: number;
  duration: number;
};

export interface IAnimation {
  sprite: string;
  loop: boolean;
  keyframes: IAnimationFrame[];
};

export type IAnimationList = {
  [key: string]: IAnimation;
};