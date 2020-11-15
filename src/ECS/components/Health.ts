import Component from "@src/ECS/Component";

import { HEALTH_COMPONENT } from "../types";

interface IHealthMetadata {
  maxHealth?: number;
  immunityDelay?: number;
}

export class Health implements Component {
  public readonly type: symbol = HEALTH_COMPONENT;
  // maximum health cap
  public readonly maxHealth: number;
  // delay during which the entity cannot take further damages or heal
  public readonly immunityDelay: number;

  public immunity: boolean;

  private _value: number;

  public constructor({ maxHealth, immunityDelay }: IHealthMetadata) {
    this.maxHealth = maxHealth ?? 0;
    this.immunityDelay = immunityDelay ?? 0;
    
    this.immunity = false;

    this._value = this.maxHealth;
  }

  public set value(value: number) {
    this._value = value;

    if (this._value < 0) {
      this._value = 0;
    }

    if (this._value > this.maxHealth) {
      this._value = this.maxHealth;
    }
  }

  public get value(): number {
    return this._value;
  }

  public get isAlive(): boolean {
    return this._value > 0;
  }

  public get isDead(): boolean {
    return this._value === 0;
  }

  public toString(): string {
    return `Health - ${this.isDead ? "dead" : "alive"} (${this.value}/${this.maxHealth})`;
  }
}
