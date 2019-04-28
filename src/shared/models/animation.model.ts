import Vector2 from '@shared/math/Vector2';
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

export interface ISpriteRenderParameters {
  flickering: boolean;
  wireframe: boolean;
  direction: Vector2;
}

export enum CharacterAnimationKeys {
  idle = 'idle',
  walking = 'walking',
  falling = 'falling',
  jumping = 'jumping',
}
