import { Entity } from "@src/ECS";

import { Consummable, PlayerInput, BoundingBox, IConsummableMetadata } from "@src/ECS/components";
import Vector2 from "@src/shared/math/Vector2";

import World from "@src/world/World";

export interface ICollectibleMetadata extends IConsummableMetadata {
  id?: string;
  amount?: number;
}

export class Collectible extends Consummable {
  public static DATA: Record<string, Record<string, number>> = {};

  public readonly id: string;
  public readonly amount: number;

  public constructor(metadata: ICollectibleMetadata = {}) {
    super(metadata);

    this.id = metadata.id ?? "";
    this.amount = metadata.amount ?? 1;
  }

  public consummatedBy(world: World, entity: Entity, at: Vector2 | null = null): void {
    super.consummatedBy(world, entity, at);

    if (typeof Collectible.DATA[entity.uuid] === "undefined") {
      Collectible.DATA[entity.uuid] = {};
    }

    if (typeof Collectible.DATA[entity.uuid][this.id] === "undefined") {
      Collectible.DATA[entity.uuid][this.id] = 0;
    }

    Collectible.DATA[entity.uuid][this.id] += this.amount;
  }

  public canBeConsummatedBy(entity: Entity): boolean {
    return entity.hasComponent(PlayerInput.COMPONENT_TYPE);
  }

  public getComponentTypes(): string[] {
    return [PlayerInput.COMPONENT_TYPE, BoundingBox.COMPONENT_TYPE];
  }

  public toString(): string {
    return Collectible.COMPONENT_TYPE;
  }
}
