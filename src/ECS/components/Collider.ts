import { Component, Entity } from "@src/ECS";

type IColliderMetadata = {
  includedEntityTypes?: string[];
  excludedEntityTypes?: string[];
};

export class Collider implements Component {
  public static COMPONENT_TYPE = "collider";

  public readonly excludedEntityTypes: string[];

  public constructor(metadata: IColliderMetadata = {}) {
    this.excludedEntityTypes = metadata.excludedEntityTypes ?? [];
  }

  public isExcluded(entity: Entity) {
    if (this.excludedEntityTypes.length > 0 && this.excludedEntityTypes.includes(entity.type)) {
      return true;
    }
    return false;
  }

  public toString(): string {
    return Collider.COMPONENT_TYPE;
  }
}
