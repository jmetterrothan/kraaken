import Entity from "@src/ECS/Entity";
import Component from "@src/ECS/Component";

import { CONSUMMABLE_COMPONENT } from "@src/ECS/types";

import World from "@src/world/World";

export interface IConsummableMetadata {
  radius?: number;
  vfx?: string;
  sfx?: string;
}

export abstract class Consummable implements Component {
  public readonly type: symbol = CONSUMMABLE_COMPONENT;

  public readonly radius: number;
  public readonly vfx: string;
  public readonly sfx: string;

  public target: Entity;

  public consummated: boolean = false;

  public constructor(metadata: IConsummableMetadata = {}) {
    this.radius = metadata.radius ?? 0;
    this.vfx = metadata.vfx;
  }

  public abstract consummatedBy(world: World, entity: Entity): void;

  public abstract canBeConsummatedBy(entity: Entity): boolean;

  public abstract getComponentTypes(): symbol[];

  public toString(): string {
    return `Consummable`;
  }
}
