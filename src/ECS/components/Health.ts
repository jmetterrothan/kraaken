import { Component } from "@src/ECS";

import SoundManager from "@src/animation/SoundManager";

interface IHealthMetadata {
  maxHealth?: number;
  immunityDelay?: number;
  deathVFX?: string;
  deathSFX?: string;
  hurtSFX?: string;
}

export class Health extends Component {
  public static COMPONENT_TYPE = "health";

  public readonly deathVFX?: string;
  public readonly deathSFX?: Howl;
  public readonly hurtSFX?: Howl;

  // maximum health cap
  public readonly maxHealth: number;
  // delay during which the entity cannot take further damages or heal
  public readonly immunityDelay: number;

  public hitDelayMs: number;
  public hit: boolean;
  public remainingHitMs: number;

  public immunity: boolean;
  public remainingImmunityMs: number;

  private _value: number;
  private _prevValue: number;

  public constructor({ maxHealth, immunityDelay, deathVFX, deathSFX, hurtSFX }: IHealthMetadata) {
    super();

    this.maxHealth = maxHealth ?? 0;
    this.immunityDelay = immunityDelay ?? 0;
    this.deathVFX = deathVFX;

    if (deathSFX) {
      this.deathSFX = SoundManager.create(deathSFX, {
        volume: 0.1,
      });
    }

    if (hurtSFX) {
      this.hurtSFX = SoundManager.create(hurtSFX, {
        volume: 0.1,
      });
    }

    this.hitDelayMs = 75;
    this.hit = false;
    this.remainingHitMs = 0;

    this.immunity = false;
    this.remainingImmunityMs = 0;

    this._value = this.maxHealth;
  }

  public set value(value: number) {
    this._prevValue = this._value;

    const damage = this._value - value;
    this._value = value;

    if (this._value < 0) {
      this._value = 0;
    }

    if (this._value > this.maxHealth) {
      this._value = this.maxHealth;
    }

    if (damage > 0) {
      // apply immunity if debuff

      this.immunity = true;
      this.remainingImmunityMs = this.immunityDelay;

      this.hit = true;
      this.remainingHitMs = this.hitDelayMs;
    }
  }

  public get value(): number {
    return this._value;
  }

  public get prevValue(): number {
    return this._prevValue;
  }

  public get isAlive(): boolean {
    return this._value > 0;
  }

  public get isDead(): boolean {
    return this._value === 0;
  }

  public get isHit(): boolean {
    return this.hit;
  }

  public toString(): string {
    return Health.COMPONENT_TYPE;
  }
}
