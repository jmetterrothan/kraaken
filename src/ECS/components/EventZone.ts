import { Entity, Component } from "@src/ECS";

import dispatch, * as GameEvents from "@src/shared/events";

import { IGameEvent } from "@src/shared/models/world.model";

import { Health } from "./Health";
import { DamageEvent } from "./DamageEvent";

export type IEventZoneMode = "contains" | "intersects";

type IEventZoneMetadata = {
  events?: IGameEvent[];
  cooldownDelay?: number;
  maxTimesTriggered?: number;
  shouldTriggerWhileActive?: boolean;
  mode?: IEventZoneMode;
  applyToEntityTypes?: string[];
  debug?: boolean;
};

export class EventZone implements Component {
  public static COMPONENT_TYPE = "event_zone";

  public readonly events: IGameEvent[];
  public readonly cooldownDelay: number;
  public readonly maxTimesTriggered: number;
  public readonly shouldTriggerWhileActive: boolean; // if false, entity needs to leave the zone for it to be triggerable again
  public readonly mode: IEventZoneMode;
  public readonly debug: boolean;
  public readonly applyToEntityTypes?: string[];

  public nbTimesTriggered: number;
  public lastTimeTriggered: number;

  public active: boolean;
  public shouldWaitToLeave: boolean;

  public constructor(metadata: IEventZoneMetadata = {}) {
    this.events = metadata.events ?? [];
    this.cooldownDelay = metadata.cooldownDelay ?? -1;
    this.maxTimesTriggered = metadata.maxTimesTriggered ?? -1;
    this.shouldTriggerWhileActive = metadata.shouldTriggerWhileActive ?? false;
    this.mode = metadata.mode ?? "intersects";
    this.debug = metadata.debug ?? false;
    this.applyToEntityTypes = metadata.applyToEntityTypes;

    this.nbTimesTriggered = 0;
    this.lastTimeTriggered = -1;

    this.active = false;
    this.shouldWaitToLeave = false;
  }

  public onEnter(subject: Entity): void {
    console.log("enter");

    if ((this.shouldTriggerWhileActive || !this.shouldWaitToLeave) && this.canBeTriggered()) {
      this.trigger(subject);

      this.shouldWaitToLeave = true;
    }

    this.active = true;
  }

  public onLeave(_subject: Entity): void {
    console.log("leave");

    this.active = false;
    this.shouldWaitToLeave = false;
  }

  private canBeTriggered(): boolean {
    const now = window.performance.now();

    if (this.maxTimesTriggered > 0 && this.nbTimesTriggered >= this.maxTimesTriggered) {
      return false;
    }

    if (this.lastTimeTriggered > 0 && this.cooldownDelay > 0 && this.lastTimeTriggered + this.cooldownDelay >= now) {
      return false;
    }

    return true;
  }

  private trigger(subject: Entity): void {
    console.log("event triggered");

    this.events.forEach(({ type, data }) => {
      switch (type) {
        case "change_level": {
          dispatch(GameEvents.changeLevel(data.levelId, data.moveTo, data.lookAt));
          return;
        }

        case "damage": {
          if (subject.hasComponent(Health.COMPONENT_TYPE)) {
            const health = subject.getComponent(Health);

            health.value += data.amount;

            subject.addComponent(new DamageEvent({ amount: Math.abs(data.amount), isKill: health.isDead, hitstop: false, cameraShake: false }));
          }
          return;
        }

        case "heal": {
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

  public toString(): string {
    return EventZone.COMPONENT_TYPE;
  }
}
