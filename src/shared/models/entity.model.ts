import World from "@src/world/World";

import { IAnimationList } from "@src/shared/models/animation.model";
import { IVector2 } from "@src/shared/models/math.model";

export interface IMovementBehaviour {
  jump(): void;
  move(world: World, delta: number): void;
}

export interface IMetadata {
  [key: string]: any;
}

export interface IObject<M = IMetadata> {
  id: string;
  type: "player" | "projectile" | "entity" | "consummable" | "sfx";
  metadata: M;
  animationList: IAnimationList;
  defaultAnimationKey: string;
}

// Entity
export interface IEntityMetadata {
  gravity?: boolean;
  collide?: boolean;
  bbox: {
    w: number;
    h: number;
  };
}

export type IEntity = IObject<IEntityMetadata>;

// Projectile (derived from entity)
export type IProjectile = IObject<
  IEntityMetadata & {
    damage: number;
    speed: IVector2;
  }
>;

// Character (derived from entity)
export type ICharacterMetadata = IEntityMetadata & {
  max_health: number;
  speed: IVector2;
  acceleration: IVector2;
  deceleration: IVector2;
  initial_jump_boost: number;
  jump_speed: number;
};

export type ICharacter = IObject<ICharacterMetadata>;

export type IPlayer = ICharacter;

// SFX
export type ISfx = IObject<{}>;
