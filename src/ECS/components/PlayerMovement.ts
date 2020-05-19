import Component from "@src/ECS/Component";

import { PLAYER_MOVEMENT_COMPONENT } from "@src/ECS/types";

import SoundManager from "@src/animation/SoundManager";

interface IPlayerMovementMetadata {
  initialJumpBoost?: number;
  jumpSpeed?: number;
  speed?: number;
  acceleration?: number;
  deceleration?: number;
  jumpSFX?: string;
}

export class PlayerMovement implements Component {
  public readonly type: symbol = PLAYER_MOVEMENT_COMPONENT;

  public climbing: boolean = false;
  public falling: boolean = false;
  public jumping: boolean = false;
  public walking: boolean = false;
  public idle: boolean = true;

  public isGrounded: boolean = false;

  public readonly initialJumpBoost: number;
  public readonly jumpSpeed: number;
  public readonly speed: number;
  public readonly acceleration: number;
  public readonly deceleration: number;

  public jumpSFX: Howl | undefined;

  public constructor({ initialJumpBoost, jumpSpeed, speed, acceleration, deceleration, jumpSFX }: IPlayerMovementMetadata) {
    this.initialJumpBoost = initialJumpBoost ?? 0;
    this.jumpSpeed = jumpSpeed ?? 0;
    this.speed = speed ?? 0;
    this.acceleration = acceleration ?? 0;
    this.deceleration = deceleration ?? 0;

    if (jumpSFX) {
      this.jumpSFX = SoundManager.create(jumpSFX, {
        volume: 0.1,
      });
    }
  }

  public toString(): string {
    return `Player movement`;
  }
}
