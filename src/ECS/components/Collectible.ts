import { Entity } from "@src/ECS";

import { Consummable, PlayerInput, BoundingBox, IConsummableMetadata } from "@src/ECS/components";

import World from "@src/world/World";

export interface ICollectibleMetadata extends IConsummableMetadata {
  id?: string;
  amount?: number;
}

export class Collectible extends Consummable {
  public static DATA = {};

  public readonly id: string;
  public readonly amount: number;

  public constructor(metadata: ICollectibleMetadata = {}) {
    super(metadata);

    this.id = metadata.id;
    this.amount = metadata.amount ?? 1;
  }

  public consummatedBy(world: World, entity: Entity): void {
    super.consummatedBy(world, entity);

    if (typeof Collectible.DATA[entity.uuid] === "undefined") {
      Collectible.DATA[entity.uuid] = {};
    }

    if (typeof Collectible.DATA[entity.uuid][this.id] === "undefined") {
      Collectible.DATA[entity.uuid][this.id] = 0;
    }

    Collectible.DATA[entity.uuid][this.id] += this.amount;

    if (this.pickUpSFX) {
      this.pickUpSFX.play();
    }
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
