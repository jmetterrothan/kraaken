import { vec3 } from "gl-matrix";

import Vector2 from "@shared/math/Vector2";

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
  flickering: boolean;
  wireframe: boolean;
  grayscale: boolean;
  direction: Vector2;
  fill?: boolean;
  alpha: number;
  color?: vec3;
}

export enum CharacterAnimationKeys {
  IDLE = "idle",
  WALKING = "walking",
  FALLING = "falling",
  JUMPING = "jumping",
  USE_PRIMARY_WEAPON = "use_primary_weapon",
}
