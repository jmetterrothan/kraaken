import Entity from "@src/ECS/Entity";
import Component from "@src/ECS/Component";

import { CONSUMMABLE_COMPONENT } from "@src/ECS/types";

import World from "@src/world/World";

import SoundManager from "@src/animation/SoundManager";

export interface IConsummableMetadata {
  radius?: number;
  pickUpVFX?: string;
  pickUpSFX?: string;
}

export abstract class Consummable implements Component {
  public readonly type: symbol = CONSUMMABLE_COMPONENT;

  public readonly radius: number;
  public readonly pickUpVFX: string;
  public readonly pickUpSFX: Howl | undefined;

  public target: Entity;

  public consummated: boolean = false;

  public constructor(metadata: IConsummableMetadata = {}) {
    this.radius = metadata.radius ?? 0;

    this.pickUpVFX = metadata.pickUpVFX;

    if (metadata.pickUpSFX) {
      this.pickUpSFX = SoundManager.create(metadata.pickUpSFX, {
        volume: 0.1,
      });
    }
  }

  public abstract consummatedBy(world: World, entity: Entity): void;

  public abstract canBeConsummatedBy(entity: Entity): boolean;

  public abstract getComponentTypes(): symbol[];

  public toString(): string {
    return `Consummable`;
  }
}
