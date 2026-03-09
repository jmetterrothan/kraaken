import { Entity, System } from "@src/ECS";

import { BoundingBox, Position, EventZone } from "@src/ECS/components";
import { DebugFlag } from "@src/enums/DebugFlag";
import { debugOverlay } from "@src/Game";
import { debugStore } from "@src/shared/services/Debug";
import { ACTIVE_ZONE_FILL_COLOR, ACTIVE_ZONE_OUTLINE_COLOR } from "@src/states/EditorState/modes/ZoneMode";

export class EventZoneSystem extends System {
  public constructor() {
    super([Position.COMPONENT_TYPE, BoundingBox.COMPONENT_TYPE, EventZone.COMPONENT_TYPE]);
  }

  execute(_delta: number): void {
    const entities = this.world.getEntities(this.componentTypes);

    if (entities.length === 0) {
      return;
    }

    const targets = this.world.getEntities([Position.COMPONENT_TYPE, BoundingBox.COMPONENT_TYPE]);

    for (const entity of entities) {
      const eventZone = entity.getComponent(EventZone);
      const bbox = entity.getComponent(BoundingBox);

      let e: Entity | null = null;

      for (const target of targets) {
        const targetBbox = target.getComponent(BoundingBox);

        if (!eventZone.canAffect(target)) {
          continue;
        }

        const intersects = eventZone.mode === "intersects" ? bbox.intersectBox(targetBbox) : bbox.containsBox(targetBbox);

        eventZone.update(target, intersects);

        if (intersects) {
          e = target;

          if (eventZone.debug || debugStore.enabled(DebugFlag.ZONE_ENTITIES)) {
            const { nbTimesTriggered } = eventZone.getEntityState(target);

            const v = this.world.worldToScreenCoords([targetBbox.x1 + targetBbox.width / 2, targetBbox.y1 + targetBbox.height + 4]);
            debugOverlay.text(`Triggered = ${eventZone.maxTimesTriggered !== -1 && nbTimesTriggered !== eventZone.maxTimesTriggered ? `${nbTimesTriggered}/${eventZone.maxTimesTriggered}` : `${nbTimesTriggered}`}`, v.x, v.y, "center");
          }
        }
      }

      if (eventZone.debug || debugStore.enabled(DebugFlag.ZONE_ENTITIES)) {
        if (e !== null) {
          bbox.helper.outlineColor = ACTIVE_ZONE_OUTLINE_COLOR;
          bbox.helper.fillColor = ACTIVE_ZONE_FILL_COLOR;
        } else {
          bbox.helper.outlineColor = bbox.helper.defaultOutlineColor;
          bbox.helper.fillColor = bbox.helper.defaultFillColor;
        }

        const v = this.world.worldToScreenCoords([bbox.x1 + bbox.width / 2, bbox.y1 + bbox.height / 2]);
        debugOverlay.text(`Event = ${eventZone.type} | Cooldown = ${eventZone.cooldownDelay / 1000}s | Max = ${eventZone.maxTimesTriggered === -1 ? "∞" : eventZone.maxTimesTriggered} ${eventZone.mode === "contains" ? `(CO${eventZone.shouldTriggerWhileActive ? "+A" : ""})` : `(IN${eventZone.shouldTriggerWhileActive ? "+A" : ""})`}`, v.x, v.y, "center");
      }
    }
  }
}
