import Entity from "@src/ECS/Entity";
import Component from "@src/ECS/Component";

import { CONSUMMABLE_COMPONENT } from "@src/ECS/types";

export interface IConsummableMetadata {
  vfx?: string;
  sfx?: string;
}

export abstract class Consummable implements Component {
  public readonly type: symbol = CONSUMMABLE_COMPONENT;

  public readonly vfx: string;
  public readonly sfx: string;

  public consummated: boolean = false;

  public constructor(metadata: IConsummableMetadata = {}) {
    this.vfx = metadata.vfx;
    this.sfx = metadata.sfx;
  }

  public abstract consummatedBy(entity: Entity): void;

  public abstract canBeConsummatedBy(entity: Entity): boolean;

  public abstract getComponentTypes(): symbol[];

  public toString(): string {
    return `Consummable`;
  }
}
