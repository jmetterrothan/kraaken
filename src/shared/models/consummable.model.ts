import { IObject, IEntityMetadata } from "@src/shared/models/entity.model";

// Consummable
export type IConsummableMetadata = IEntityMetadata & {
  sfx: string;
};

export type IConsummable = IObject<IConsummableMetadata>;

// Potion Effects (derived from consummable)
export type IEffectPotion = IObject<IConsummableMetadata>;
