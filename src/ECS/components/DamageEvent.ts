import { Component } from "@src/ECS";
import Vector2 from "@src/shared/math/Vector2";

type IDamageEventMetadata = {
  amount: number;
  isKill: boolean;
  hitstop: boolean;
  cameraShake: boolean;
  source?: Vector2;
  knockback?: number;
  ignoreMass?: boolean;
};

export class DamageEvent extends Component {
  static COMPONENT_TYPE = "damage_event";

  public amount: number;
  public isKill: boolean;
  public hitstop: boolean;
  public cameraShake: boolean;
  public source?: Vector2;
  public knockback?: number;
  public ignoreMass?: boolean;

  constructor(metadata: IDamageEventMetadata) {
    super();

    this.amount = metadata.amount ?? 0;
    this.isKill = metadata.isKill ?? false;
    this.hitstop = metadata.hitstop ?? false;
    this.cameraShake = metadata.cameraShake ?? false;
    this.source = metadata.source;
    this.knockback = metadata.knockback ?? 0;
    this.ignoreMass = metadata.ignoreMass ?? false;
  }

  public toString(): string {
    return DamageEvent.COMPONENT_TYPE;
  }
}
