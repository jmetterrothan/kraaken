import Entity from "@src/objects/entity/Entity";

import { IObject, IEntityMetadata } from "@src/shared/models/entity.model";

export interface IConsummableBehaviour {
  consummatedBy(entity: Entity): void;
}

// Consummable
export type IConsummableMetadata = IEntityMetadata & {
  sfx: string;
};

export type IConsummable = IObject<IConsummableMetadata>;

// Potion Effects (derived from consummable)
export type IEffectPotion = IObject<IConsummableMetadata>;
