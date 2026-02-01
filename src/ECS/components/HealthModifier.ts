import { Entity } from "@src/ECS";

import { Consummable, Health, IConsummableMetadata, BoundingBox, DamageEvent } from "@src/ECS/components";
import Vector2 from "@src/shared/math/Vector2";

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

  public consummatedBy(world: World, entity: Entity, at: Vector2 | null = null): void {
    super.consummatedBy(world, entity, at);

    const health = entity.getComponent(Health);

    health.value += this.amount;

    if (this.amount < 0) {
      entity.addComponent(
        new DamageEvent({
          amount: Math.abs(this.amount),
          isKill: health.isDead,
          hitstop: false,
          cameraShake: false,
        })
      );
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

    if (health.immunity || health.isDead) {
      // health debuff should only be applied if the entity is alive
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
