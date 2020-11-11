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

export interface ISpriteRenderRenderOptions {
  flickering?: boolean;
  flickerSpeed?: number;
  grayscale?: boolean;
  outline?: boolean;
  outlineColor?: vec4;
  tintEffect: TintEffect;
  tintColor: vec4;
  reflect?: boolean;
}
