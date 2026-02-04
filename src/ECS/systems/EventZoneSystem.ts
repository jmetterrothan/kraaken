import { System } from "@src/ECS";

import { BoundingBox, Position, EventZone, Health } from "@src/ECS/components";

export class EventZoneSystem extends System {
  public constructor() {
    super([Position.COMPONENT_TYPE, BoundingBox.COMPONENT_TYPE, EventZone.COMPONENT_TYPE]);
  }

  execute(_delta: number): void {
    const entities = this.world.getEntities(this.componentTypes);

    if (entities.length === 0) {
      return;
    }

    const targets = this.world.getEntities([Health.COMPONENT_TYPE, BoundingBox.COMPONENT_TYPE]);

    for (const entity of entities) {
      const zone = entity.getComponent(EventZone);
      const bbox = entity.getComponent(BoundingBox);

      for (const target of targets) {
        const targetBbox = target.getComponent(BoundingBox);
        const targetHealth = target.getComponent(Health);

        if (Array.isArray(zone.applyToEntityTypes) && !zone.applyToEntityTypes.includes(target.type)) {
          continue;
        }

        if (targetHealth.isDead) {
          continue;
        }

        const active = zone.mode === "intersects" ? bbox.intersectBox(targetBbox) : bbox.containsBox(targetBbox);

        if (zone.active !== active) {
          if (active) {
            zone.onEnter(target);
          } else {
            zone.onLeave(target);
          }
        }
      }
    }
  }
}
