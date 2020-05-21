import Color from "@src/shared/helper/Color";

export interface IKeyFrame {
  row: number;
  col: number;
  duration: number;
}

export interface IAnimation {
  sprite: string;
  loop: boolean;
  keyframes: IKeyFrame[];
}

export type IAnimationList = Record<string, IAnimation>;

export interface ISpriteRenderParameters {
  flickering?: boolean;
  flashing?: boolean;
  grayscale?: boolean;
  wireframe?: boolean;
  alpha: number;
  color?: Color;
  reflect?: boolean;
}
