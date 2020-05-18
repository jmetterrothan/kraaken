import Entity from "@src/ECS/Entity";

import { Consummable, Health, IConsummableMetadata, Position } from "@src/ECS/components";
import { PLAYER_INPUT_COMPONENT, POSITION_COMPONENT, BOUNDING_BOX_COMPONENT, HEALTH_COMPONENT, CONSUMMABLE_COMPONENT } from "@src/ECS/types";

import World from "@src/world/World";

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

  public consummatedBy(world: World, entity: Entity): void {
    const position = entity.getComponent<Position>(POSITION_COMPONENT);
    const health = entity.getComponent<Health>(HEALTH_COMPONENT);

    health.value += this.amount;

    if (health.isDead && !entity.hasComponent(PLAYER_INPUT_COMPONENT)) {
      world.removeEntity(entity);
      world.playEffectOnceAt("explosion", position);
    }
  }

  public canBeConsummatedBy(entity: Entity): boolean {
    if (!entity.hasComponent(HEALTH_COMPONENT)) {
      return false;
    }

    const health = entity.getComponent<Health>(HEALTH_COMPONENT);

    if (this.amount > 0) {
      // health buff should only be applied if entity has taken some damage
      return health.value < health.maxHealth;
    }
    // health debuff should only be applied if the entity is alive
    return health.isAlive;
  }

  public getComponentTypes(): symbol[] {
    return [HEALTH_COMPONENT, BOUNDING_BOX_COMPONENT];
  }
}
