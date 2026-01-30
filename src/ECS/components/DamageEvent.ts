import { Component } from "@src/ECS";

export class DamageEvent extends Component {
  static COMPONENT_TYPE = "damage_event";

  public amount: number;
  public isKill: boolean;

  constructor(amount: number, isKill = false) {
    super();

    this.amount = amount;
    this.isKill = isKill;
  }

  public toString(): string {
    return DamageEvent.COMPONENT_TYPE;
  }
}
