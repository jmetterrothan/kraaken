import Entity from "@src/ECS/Entity";

import { Consummable, Health, IConsummableMetadata } from "@src/ECS/components";
import { PLAYER_INPUT_COMPONENT, BOUNDING_BOX_COMPONENT, HEALTH_COMPONENT, CONSUMMABLE_COMPONENT } from "@src/ECS/types";

interface IHealthModifierMetadata extends IConsummableMetadata {
  amount?: number;
}

export class HealthModifier extends Consummable {
  public readonly symbol: symbol = CONSUMMABLE_COMPONENT;

  public readonly amount: number;

  public constructor(metadata: IHealthModifierMetadata = {}) {
    super(metadata);

    this.amount = metadata.amount ?? 1;
  }

  public consummatedBy(entity: Entity): void {
    const healthComp = entity.getComponent<Health>(HEALTH_COMPONENT);

    if (healthComp.isAlive) {
      healthComp.health += this.amount;
    }
  }

  public canBeConsummatedBy(entity: Entity): boolean {
    if (!entity.hasComponent(HEALTH_COMPONENT)) {
      return false;
    }

    const healthComp = entity.getComponent<Health>(HEALTH_COMPONENT);

    if (this.amount > 0) {
      // health buff should only be applied if entity has taken some damage
      return healthComp.health < healthComp.maxHealth;
    }
    // health debuff should only be applied if the entity is alive
    return healthComp.isAlive;
  }

  public getComponentTypes(): symbol[] {
    return [PLAYER_INPUT_COMPONENT, BOUNDING_BOX_COMPONENT];
  }
}
