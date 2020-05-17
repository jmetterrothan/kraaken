import Entity from "@src/ECS/Entity";

import { Consummable, IConsummableMetadata } from "@src/ECS/components";
import { PLAYER_INPUT_COMPONENT, BOUNDING_BOX_COMPONENT, CONSUMMABLE_COMPONENT } from "@src/ECS/types";

import World from "@src/world/World";

import pickUpSoundFX from "@src/data/level1/assets/sounds/pickup.wav";

export interface ICollectibleMetadata extends IConsummableMetadata {
  id?: string;
  amount?: number;
}

export class Collectible extends Consummable {
  public static DATA = {};

  public readonly type: symbol = CONSUMMABLE_COMPONENT;

  public readonly id: string;
  public readonly amount: number;

  public pickUpSoundFX: Howl;

  public constructor(metadata: ICollectibleMetadata = {}) {
    super(metadata);

    this.id = metadata.id;
    this.amount = metadata.amount ?? 1;

    this.pickUpSoundFX = new Howl({
      src: pickUpSoundFX,
      autoplay: false,
      volume: 0.1,
    });
  }

  public consummatedBy(world: World, entity: Entity): void {
    if (typeof Collectible.DATA[entity.uuid] === "undefined") {
      Collectible.DATA[entity.uuid] = {};
    }

    if (typeof Collectible.DATA[entity.uuid][this.id] === "undefined") {
      Collectible.DATA[entity.uuid][this.id] = 0;
    }

    Collectible.DATA[entity.uuid][this.id] += this.amount;

    this.pickUpSoundFX.play();
  }

  public canBeConsummatedBy(entity: Entity): boolean {
    return entity.hasComponent(PLAYER_INPUT_COMPONENT);
  }

  public getComponentTypes(): symbol[] {
    return [PLAYER_INPUT_COMPONENT, BOUNDING_BOX_COMPONENT];
  }
}
