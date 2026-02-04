import { Component, Entity } from "@src/ECS";

type IColliderMetadata = {
  includedEntityTypes?: string[];
  excludedEntityTypes?: string[];
};

export class Collider implements Component {
  public static COMPONENT_TYPE = "collider";

  public readonly includedEntityTypes: string[];
  public readonly excludedEntityTypes: string[];

  public constructor(metadata: IColliderMetadata = {}) {
    this.includedEntityTypes = metadata.includedEntityTypes ?? [];
    this.excludedEntityTypes = metadata.excludedEntityTypes ?? [];
  }

  public isExcluded(entity: Entity) {
    if (this.includedEntityTypes.length > 0 && !this.includedEntityTypes.includes(entity.type)) {
      return true;
    }
    if (this.excludedEntityTypes.length > 0 && this.excludedEntityTypes.includes(entity.type)) {
      return true;
    }
    return false;
  }

  public toString(): string {
    return Collider.COMPONENT_TYPE;
  }
}
