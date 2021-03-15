import { System } from "@src/ECS";

import { BoundingBox, Position, EventZone, Health } from "@src/ECS/components";

export class EventZoneSystem extends System {
  public constructor() {
    super([Position.COMPONENT_TYPE, BoundingBox.COMPONENT_TYPE, EventZone.COMPONENT_TYPE]);
  }

  execute(delta: number): void {
    const entities = this.world.getEntities(this.componentTypes);

    if (entities.length === 0) {
      return;
    }

    const targetBbox = this.world.player.getComponent(BoundingBox);
    const targetHealth = this.world.player.getComponent(Health);

    if (targetHealth.isDead) {
      return;
    }

    for (const entity of entities) {
      const zone = entity.getComponent(EventZone);
      const bbox = entity.getComponent(BoundingBox);

      zone.active = zone.mode === "intersects" ? bbox.intersectBox(targetBbox) : bbox.containsBox(targetBbox);

      if (zone.canBeTriggered()) {
        zone.trigger(this.world.player);
      }
    }
  }
}
