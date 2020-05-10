import Entity from "@src/ECS/Entity";

import { Consummable, IConsummableMetadata } from "@src/ECS/components";
import { PLAYER_INPUT_COMPONENT, BOUNDING_BOX_COMPONENT, CONSUMMABLE_COMPONENT } from "@src/ECS/types";

export interface ICollectibleMetadata extends IConsummableMetadata {
  id?: string;
  amount?: number;
}

export class Collectible extends Consummable {
  public static DATA = {};

  public readonly type: symbol = CONSUMMABLE_COMPONENT;

  public readonly id: string;
  public readonly amount: number;

  public constructor(metadata: ICollectibleMetadata = {}) {
    super(metadata);

    this.id = metadata.id;
    this.amount = metadata.amount ?? 1;
  }

  public consummatedBy(entity: Entity): void {
    if (typeof Collectible.DATA[entity.uuid] === "undefined") {
      Collectible.DATA[entity.uuid] = {};
    }

    if (typeof Collectible.DATA[entity.uuid][this.id] === "undefined") {
      Collectible.DATA[entity.uuid][this.id] = 0;
    }

    Collectible.DATA[entity.uuid][this.id] += this.amount;
    console.log(Collectible.DATA[entity.uuid]);
  }

  public canBeConsummatedBy(entity: Entity): boolean {
    return entity.hasComponent(PLAYER_INPUT_COMPONENT);
  }

  public getComponentTypes(): symbol[] {
    return [PLAYER_INPUT_COMPONENT, BOUNDING_BOX_COMPONENT];
  }
}
