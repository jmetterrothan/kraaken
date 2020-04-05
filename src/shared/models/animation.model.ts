import { vec3 } from "gl-matrix";

import Vector2 from "@shared/math/Vector2";
import Animation from "@src/animation/Animation";

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
