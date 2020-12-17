import { Component, Entity } from "@src/ECS";

import { Consummable, Health, IConsummableMetadata, PlayerInput, BoundingBox, Position } from "@src/ECS/components";

import World from "@src/world/World";

interface IHealthModifierMetadata extends IConsummableMetadata {
  amount?: number;
}

export class HealthModifier extends Consummable {
  public readonly amount: number;

  public constructor(metadata: IHealthModifierMetadata = {}) {
    super(metadata);

    this.amount = metadata.amount ?? 1;
  }

  public consummatedBy(world: World, entity: Entity): void {
    super.consummatedBy(world, entity);

    const position = entity.getComponent(Position);
    const health = entity.getComponent(Health);

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

    if (health.isDead && !entity.hasComponent(PlayerInput.COMPONENT_TYPE)) {
      world.removeEntity(entity);
      world.playEffectOnceAt("explosion", position);
    }
  }

  public canBeConsummatedBy(entity: Entity): boolean {
    if (!super.canBeConsummatedBy(entity)) {
      return false;
    }

    if (!entity.hasComponent(Health.COMPONENT_TYPE)) {
      return false;
    }

    const health = entity.getComponent(Health);

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

  public getComponentTypes(): string[] {
    return [Health.COMPONENT_TYPE, BoundingBox.COMPONENT_TYPE];
  }
}
