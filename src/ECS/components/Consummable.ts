import Entity from "@src/ECS/Entity";
import Component from "@src/ECS/Component";

import { CONSUMMABLE_COMPONENT } from "@src/ECS/types";

import World from "@src/world/World";

import SoundManager from "@src/animation/SoundManager";

export interface IConsummableMetadata {
  radius?: number;
  limit?: number;
  applyToEntityTypes?: string[];
  pickUpVFX?: string;
  pickUpSFX?: string;
}

export abstract class Consummable implements Component {
  public readonly type: symbol = CONSUMMABLE_COMPONENT;

  public readonly applyToEntityTypes?: string[];
  public readonly radius: number;
  public readonly limit: number;
  public readonly pickUpVFX: string;
  public readonly pickUpSFX?: Howl;

  public target: Entity;

  public consummated = false;
  public nbOfTimesConsummated = 0;

  public constructor(metadata: IConsummableMetadata = {}) {
    this.radius = metadata.radius ?? 0;
    this.limit = metadata.limit ?? 1;
    this.applyToEntityTypes = metadata.applyToEntityTypes;

    this.pickUpVFX = metadata.pickUpVFX;

    if (metadata.pickUpSFX) {
      this.pickUpSFX = SoundManager.create(metadata.pickUpSFX, {
        volume: 0.1,
      });
    }
  }

  public consummatedBy(world: World, entity: Entity): void {
    this.nbOfTimesConsummated += 1;
  }

  public canBeConsummatedBy(entity: Entity): boolean {
    if (this.limit !== -1 && this.nbOfTimesConsummated >= this.limit) {
      return false;
    }

    // ignore entities not affected by the modifier
    if (Array.isArray(this.applyToEntityTypes) && !this.applyToEntityTypes.includes(entity.type)) {
      return false;
    }
    return true;
  }

  public abstract getComponentTypes(): symbol[];

  public toString(): string {
    return `Consummable`;
  }
}
