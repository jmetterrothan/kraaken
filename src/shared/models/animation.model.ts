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
}

export enum PlayerAnimationKeys {
  DEAD = "hero:dead",
  IDLE = "hero:idle",
  WALKING = "hero:walking",
  FALLING = "hero:falling",
  JUMPING = "hero:jumping",
  USE_PRIMARY_WEAPON = "hero:use_primary_weapon",
}

export enum ProjectileAnimationKeys {
  DEFAULT = "energy_bolt:idle",
  HIT = "energy_bolt:hit",
}
