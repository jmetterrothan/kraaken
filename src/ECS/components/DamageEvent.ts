import { Component } from "@src/ECS";
import Vector2 from "@src/shared/math/Vector2";
import { IVector2 } from "@src/shared/models/math.model";

type IDamageEventMetadata = {
  amount: number;
  isKill: boolean;
  hitstop: boolean;
  cameraShake: boolean;
  source?: IVector2;
  knockback?: IVector2;
  ignoreMass?: boolean;
};

export class DamageEvent extends Component {
  static COMPONENT_TYPE = "damage_event";

  public amount: number;
  public isKill: boolean;
  public hitstop: boolean;
  public cameraShake: boolean;
  public source?: Vector2;
  public knockback: Vector2;
  public ignoreMass?: boolean;

  constructor(metadata: IDamageEventMetadata) {
    super();

    this.amount = metadata.amount ?? 0;
    this.isKill = metadata.isKill ?? false;
    this.hitstop = metadata.hitstop ?? false;
    this.cameraShake = metadata.cameraShake ?? false;
    this.source = metadata.source ? Vector2.create(metadata.source.x, metadata.source.y) : undefined;
    this.knockback = Vector2.create(metadata.knockback?.x ?? 0, metadata.knockback?.y ?? 0);
    this.ignoreMass = metadata.ignoreMass ?? false;
  }

  public toString(): string {
    return DamageEvent.COMPONENT_TYPE;
  }
}
