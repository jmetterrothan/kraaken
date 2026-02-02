import { Component, Entity } from "@src/ECS";

import { IConsummableMetadata } from "@src/ECS/components";

interface IHealthModifierMetadata extends IConsummableMetadata {
  damage?: number;
  knockback?: number;
  maxRadius?: number;
  expandMs?: number;
  applyToEntityTypes?: string[];
}

export class Explosion extends Component {
  public static COMPONENT_TYPE = "damage";

  public readonly damage: number;
  public readonly knockback: number;
  public readonly maxRadius: number;
  public readonly expandMs: number;
  public readonly applyToEntityTypes?: string[];

  private hits = new Set<string>();
  public elapsedMs = 0;
  public radius = 0;

  public constructor(metadata: IHealthModifierMetadata = {}) {
    super();

    this.damage = metadata.damage ?? 1;
    this.knockback = metadata.knockback ?? 0;
    this.maxRadius = metadata.maxRadius ?? 0;
    this.expandMs = metadata.expandMs ?? 0;
    this.applyToEntityTypes = metadata.applyToEntityTypes;
  }

  public canAffect(target: Entity): boolean {
    if (this.applyToEntityTypes && !this.applyToEntityTypes.includes(target.type)) {
      return false;
    }
    return true;
  }

  public hasHit(entity: Entity) {
    return this.hits.has(entity.uuid);
  }

  public markAsHit(entity: Entity) {
    this.hits.add(entity.uuid);
  }

  public toString(): string {
    return Explosion.COMPONENT_TYPE;
  }
}
