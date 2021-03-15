import { Entity, Component } from "@src/ECS";

import dispatch, * as GameEvents from "@src/shared/events";

import { IGameEvent } from "@src/shared/models/world.model";

import { Health } from "./Health";

export type IEventZoneMode = "contains" | "intersects";

type IEventZoneMetadata = {
  events?: IGameEvent[];
  cooldownDelay?: number;
  maxTimesTriggered?: number;
  mode?: IEventZoneMode;
};

export class EventZone implements Component {
  public static COMPONENT_TYPE = "event_zone";

  public events: IGameEvent[];
  public cooldownDelay: number;
  public maxTimesTriggered: number;
  public mode: IEventZoneMode;
  public debug: boolean;

  public nbTimesTriggered: number;
  public lastTimeTriggered: number;
  public active: boolean;

  public constructor(metadata: IEventZoneMetadata = {}) {
    this.events = metadata.events ?? [];
    this.cooldownDelay = metadata.cooldownDelay ?? -1;
    this.maxTimesTriggered = metadata.maxTimesTriggered ?? -1;
    this.mode = metadata.mode ?? "intersects";

    this.nbTimesTriggered = 0;
    this.lastTimeTriggered = -1;
    this.active = false;
  }

  public trigger(subject: Entity): void {
    this.events.forEach(({ type, data }) => {
      switch (type) {
        case "change_room": {
          // ...
          return;
        }

        case "damage": {
          if (subject.hasComponent(Health.COMPONENT_TYPE)) {
            const health = subject.getComponent(Health);
            health.value += data.amount;
          }
          return;
        }

        case "spawn": {
          dispatch(
            GameEvents.spawnEvent(
              data.uuid, //
              data.type,
              data.position,
              data.direction,
              data.debug,
              false
            )
          );
          return;
        }

        case "despawn": {
          dispatch(GameEvents.despawnEvent(data.uuid, false));
          return;
        }
      }
    });

    this.nbTimesTriggered += 1;
    this.lastTimeTriggered = window.performance.now();
  }

  canBeTriggered(): boolean {
    const now = window.performance.now();

    if (!this.active) {
      return false;
    }

    if (this.maxTimesTriggered > 0 && this.nbTimesTriggered >= this.maxTimesTriggered) {
      return false;
    }

    if (this.lastTimeTriggered > 0 && this.cooldownDelay > 0 && this.lastTimeTriggered + this.cooldownDelay >= now) {
      return false;
    }

    return true;
  }

  public toString(): string {
    return EventZone.COMPONENT_TYPE;
  }
}
