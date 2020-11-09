import { vec4 } from 'gl-matrix';

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

export enum TintEffect {
  NONE = 0,
  EFFECT1 = 1,
  EFFECT2 = 2,
}

export interface ISpriteRenderParameters {
  flickering?: boolean;
  grayscale?: boolean;
  outline?: boolean;
  tint: {
    color: vec4,
    effect: TintEffect;
  }
  reflect?: boolean;
}
