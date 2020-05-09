import { HEALTH_COMPONENT } from "../types";

import { Component } from "..";

interface IHealthMetadata {
  maxHealth?: number;
}

export class Health implements Component {
  public readonly type: string = HEALTH_COMPONENT;
  public readonly maxHealth: number;

  private _value: number;

  public constructor({ maxHealth }: IHealthMetadata) {
    this.maxHealth = maxHealth ?? 0;

    this._value = this.maxHealth;
  }

  public set health(value: number) {
    this._value = value;

    if (this._value < 0) {
      this._value = 0;
    }

    if (this._value > this.maxHealth) {
      this._value = this.maxHealth;
    }
  }

  public get health(): number {
    return this._value;
  }

  public toString(): string {
    return `Health - ${this.health === 0 ? "dead" : "alive"} (${this.health}/${this.maxHealth})`;
  }
}
