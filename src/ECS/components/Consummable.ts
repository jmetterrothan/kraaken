import Entity from "@src/ECS/Entity";
import Component from "@src/ECS/Component";

import { CONSUMMABLE_COMPONENT } from "@src/ECS/types";

export abstract class Consummable implements Component {
  public readonly type: symbol = CONSUMMABLE_COMPONENT;

  public consummated: boolean = false;

  public abstract consummatedBy(entity: Entity): void;

  public abstract canBeConsummatedBy(entity: Entity): boolean;

  public abstract getComponentTypes(): symbol[];

  public toString(): string {
    return `Consummable`;
  }
}
