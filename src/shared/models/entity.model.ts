import World from "@src/world/World";

import { IAnimationList } from "@src/shared/models/animation.model";
import { IVector2 } from "@src/shared/models/math.model";

export interface IMovement {
  move(world: World, delta: number): void;
}

export interface IMetadata {
  [key: string]: any;
}

export interface IObject<M = IMetadata> {
  id: string;
  type: "player" | "entity" | "loot" | "sfx";
  metadata: M;
  animationList: IAnimationList;
  defaultAnimationKey: string;
}

export interface IEntityMetadata {
  gravity?: boolean;
  collide?: boolean;
  bbox: {
    w: number;
    h: number;
  };
}

export type IEntity = IObject<IEntityMetadata>;

export type IPlayer = IObject<
  IEntityMetadata & {
    speed: IVector2;
    acceleration: IVector2;
    deceleration: IVector2;
    initial_jump_boost: number;
    jump_speed: number;
  }
>;

export type ILoot = IObject<
  IEntityMetadata & {
    sfx: string;
  }
>;

export type ISfx = IObject<{}>;
