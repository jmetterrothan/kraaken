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
    super.consummatedBy(world, entity);

    const position = entity.getComponent<Position>(POSITION_COMPONENT);
    const health = entity.getComponent<Health>(HEALTH_COMPONENT);

    health.value += this.amount;

    // apply immunity if debuff
    if (health.immunityDelay > 0) {
      health.immunity = true;

      setTimeout(() => {
        health.immunity = false;
      }, health.immunityDelay);
    }

    if (this.pickUpSFX) {
      this.pickUpSFX.play();
    }

    if (health.isDead && !entity.hasComponent(PLAYER_INPUT_COMPONENT)) {
      world.removeEntity(entity);
      world.playEffectOnceAt("explosion", position);
    }
  }

  public canBeConsummatedBy(entity: Entity): boolean {
    if (!super.canBeConsummatedBy(entity)) {
      return false;
    }

    if (!entity.hasComponent(HEALTH_COMPONENT)) {
      return false;
    }

    const health = entity.getComponent<Health>(HEALTH_COMPONENT);

    if (health.immunity) {
      return false;
    }

    // health debuff should only be applied if the entity is alive
    if (health.isDead) {
      return false;
    }

    // health buff should only be applied if entity has taken some damage
    if (this.amount > 0 && health.value >= health.maxHealth) {
      return false;
    }

    return true;
  }

  public getComponentTypes(): symbol[] {
    return [HEALTH_COMPONENT, BOUNDING_BOX_COMPONENT];
  }
}
