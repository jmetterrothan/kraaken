import { Component } from "@src/ECS";

type IDamageEventMetadata = {
  amount: number;
  isKill: boolean;
  hitstop: boolean;
  cameraShake: boolean;
};

export class DamageEvent extends Component {
  static COMPONENT_TYPE = "damage_event";

  public amount: number;
  public isKill: boolean;
  public hitstop: boolean;
  public cameraShake: boolean;

  constructor(metadata: IDamageEventMetadata) {
    super();

    this.amount = metadata.amount ?? 0;
    this.isKill = metadata.isKill ?? false;
    this.hitstop = metadata.hitstop ?? false;
    this.cameraShake = metadata.cameraShake ?? false;
  }

  public toString(): string {
    return DamageEvent.COMPONENT_TYPE;
  }
}
