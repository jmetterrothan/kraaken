import Entity from "@src/ECS/Entity";

import { Consummable, Health } from "@src/ECS/components";
import { PLAYER_INPUT_COMPONENT, BOUNDING_BOX_COMPONENT, HEALTH_COMPONENT, CONSUMMABLE_COMPONENT } from "@src/ECS/types";

export class HealthPotion extends Consummable {
  public readonly symbol: symbol = CONSUMMABLE_COMPONENT;

  public consummatedBy(entity: Entity): void {
    const healthComp = entity.getComponent<Health>(HEALTH_COMPONENT);

    if (healthComp.isAlive) {
      healthComp.health += 1;
    }
  }

  public canBeConsummatedBy(entity: Entity): boolean {
    if (!entity.hasComponent(HEALTH_COMPONENT)) {
      return false;
    }

    const healthComp = entity.getComponent<Health>(HEALTH_COMPONENT);
    return healthComp.health < healthComp.maxHealth;
  }

  public getComponentTypes(): symbol[] {
    return [PLAYER_INPUT_COMPONENT, BOUNDING_BOX_COMPONENT];
  }
}
