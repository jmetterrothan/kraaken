import { Entity, Component } from "@src/ECS";

import dispatch, * as GameEvents from "@src/shared/events";

import { IGameEvent } from "@src/shared/models/world.model";

import { Health } from "./Health";
import { DamageEvent } from "./DamageEvent";
import { Checkpoint } from "./Checkpoint";
import { PlayerInput } from "./PlayerInput";

export type IEventZoneMode = "contains" | "intersects";

type IEventZoneMetadata = Partial<IGameEvent> & {
  cooldownDelay?: number;
  maxTimesTriggered?: number;
  shouldTriggerWhileActive?: boolean;
  mode?: IEventZoneMode;
  applyToEntityTypes?: string[];
  debug?: boolean;
};

type IEventZonePerEntityState = {
  nbTimesTriggered: number;
  lastTimeTriggered: number;
  active: boolean;
  wasActive: boolean;
};

export class EventZone implements Component {
  public static COMPONENT_TYPE = "event";

  public readonly type: string;
  public readonly data: Record<string, any>;
  public readonly cooldownDelay: number;
  public readonly maxTimesTriggered: number;
  public readonly shouldTriggerWhileActive: boolean; // if false, entity needs to leave the zone for it to be triggerable again
  public readonly mode: IEventZoneMode;
  public readonly debug: boolean;
  public readonly applyToEntityTypes?: string[];

  public entities: Map<string, IEventZonePerEntityState>;

  public constructor(metadata: IEventZoneMetadata = {}) {
    this.type = metadata.type ?? "unknown";
    this.data = metadata.data ?? {};
    this.cooldownDelay = metadata.cooldownDelay ?? -1;
    this.maxTimesTriggered = metadata.maxTimesTriggered ?? -1;
    this.shouldTriggerWhileActive = metadata.shouldTriggerWhileActive ?? false;
    this.mode = metadata.mode ?? "intersects";
    this.debug = metadata.debug ?? false;
    this.applyToEntityTypes = metadata.applyToEntityTypes;

    this.entities = new Map<string, IEventZonePerEntityState>();
  }

  private enter(subject: Entity): void {
    console.debug(`Entity "${subject.uuid}" entered event zone`);

    const oldState = this.getEntityState(subject);
    this.setEntityState(subject, { wasActive: oldState.active, active: true });

    if (this.canBeTriggeredBy(subject)) {
      this.trigger(subject);

      this.setEntityState(subject, { nbTimesTriggered: oldState.nbTimesTriggered + 1, lastTimeTriggered: window.performance.now() });
    }
  }

  private leave(subject: Entity): void {
    console.debug(`Entity "${subject.uuid}" left event zone`);

    const oldState = this.getEntityState(subject);
    this.setEntityState(subject, { wasActive: oldState.active, active: false });
  }

  public update(entity: Entity, active: boolean) {
    const oldState = this.getEntityState(entity);

    if ((!oldState.active && active && !this.shouldTriggerWhileActive) || (active && this.shouldTriggerWhileActive)) {
      this.enter(entity);
      return;
    }

    if (oldState.active && !active) {
      this.leave(entity);
      return;
    }
  }

  public canAffect(entity: Entity): boolean {
    const targetHealth = entity.getComponent(Health);

    if (targetHealth && targetHealth.isDead) {
      return false;
    }

    if (Array.isArray(this.applyToEntityTypes) && !this.applyToEntityTypes.includes(entity.type)) {
      return false;
    }

    switch (this.type) {
      case "heal":
      case "damage":
        return entity.hasComponent(Health.COMPONENT_TYPE);

      case "spawn":
      case "despawn":
      case "checkpoint":
      case "change_level":
        return entity.hasComponent(PlayerInput.COMPONENT_TYPE);
    }

    return true;
  }

  private canBeTriggeredBy(subject: Entity) {
    const now = window.performance.now();

    const currentState = this.entities.get(subject.uuid) ?? { active: false, wasActive: false, lastTimeTriggered: -1, nbTimesTriggered: 0 };

    if (!this.shouldTriggerWhileActive && currentState.active && currentState.wasActive) {
      return false;
    }

    if (this.maxTimesTriggered !== -1 && currentState.nbTimesTriggered >= this.maxTimesTriggered) {
      return false;
    }

    if (currentState.lastTimeTriggered > 0 && this.cooldownDelay > 0 && currentState.lastTimeTriggered + this.cooldownDelay >= now) {
      return false;
    }

    return true;
  }

  private trigger(subject: Entity): void {
    console.debug(`Entity "${subject.uuid}" triggered event zone`, this);

    switch (this.type) {
      case "checkpoint": {
        if (subject.hasComponent(Checkpoint.COMPONENT_TYPE)) {
          subject.removeComponent(Checkpoint.COMPONENT_TYPE);
        }
        subject.addComponent(new Checkpoint({ moveTo: this.data.moveTo }));

        return;
      }

      case "change_level": {
        dispatch(GameEvents.changeLevel(this.data.levelId, this.data.moveTo, this.data.lookAt));
        return;
      }

      case "damage": {
        if (subject.hasComponent(Health.COMPONENT_TYPE)) {
          const health = subject.getComponent(Health);

          health.value += this.data.amount;

          subject.addComponent(new DamageEvent({ amount: Math.abs(this.data.amount), isKill: health.isDead, hitstop: false, cameraShake: false }));
        }
        return;
      }

      case "heal": {
        if (subject.hasComponent(Health.COMPONENT_TYPE)) {
          const health = subject.getComponent(Health);

          health.value += this.data.amount;
        }
        return;
      }

      case "spawn": {
        dispatch(
          GameEvents.spawnEvent(
            this.data.uuid, //
            this.data.type,
            this.data.components,
            false
          )
        );
        return;
      }

      case "despawn": {
        dispatch(GameEvents.despawnEvent(this.data.uuid, false));
        return;
      }

      default:
        console.log(`Unsupported event "${this.type}"`);
    }
  }

  getEntityState(subject: Entity): IEventZonePerEntityState {
    return { active: false, wasActive: false, lastTimeTriggered: -1, nbTimesTriggered: 0, ...this.entities.get(subject.uuid) };
  }

  setEntityState(subject: Entity, state: Partial<IEventZonePerEntityState>) {
    const oldState = this.getEntityState(subject);

    this.entities.set(subject.uuid, { ...oldState, ...state });
  }

  public toString(): string {
    return EventZone.COMPONENT_TYPE;
  }
}
