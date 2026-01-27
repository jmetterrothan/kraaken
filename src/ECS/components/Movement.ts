import { Component } from "@src/ECS";

import SoundManager from "@src/animation/SoundManager";

interface IMovementMetadata {
  initialJumpBoost?: number;
  jumpSpeed?: number;
  speed?: number;
  acceleration?: number;
  deceleration?: number;
  wallSlideMaxFallSpeed?: number;
  wallClimbSpeed?: number;
  wallClimbAcceleration?: number;
  jumpSFX?: string;
}

export class Movement implements Component {
  public static COMPONENT_TYPE = "movement";

  public wallJumping = false;
  public wallSliding = false;
  public wallClimbing = false;
  public falling = false;
  public jumping = false;
  public walking = false;
  public idle = true;

  public airborneSince: number | null = null;
  public wasGrounded: boolean = true;

  public isBlockedLeft = false;
  public isBlockedRight = false;
  public isBlockedUp = false;
  public isBlockedDown = false;

  public readonly initialJumpBoost: number;
  public readonly jumpSpeed: number;
  public readonly speed: number;
  public readonly acceleration: number;
  public readonly deceleration: number;
  public readonly wallSlideMaxFallSpeed: number;
  public readonly wallClimbSpeed: number;
  public readonly wallClimbAcceleration: number;

  public lastEffectTime: number;
  public lastWallJumpTime: number;

  public jumpSFX: Howl | undefined;

  public constructor({ initialJumpBoost, jumpSpeed, speed, acceleration, deceleration, wallSlideMaxFallSpeed, wallClimbSpeed, wallClimbAcceleration, jumpSFX }: IMovementMetadata) {
    this.initialJumpBoost = initialJumpBoost ?? 0;
    this.jumpSpeed = jumpSpeed ?? 0;
    this.speed = speed ?? 0;
    this.acceleration = acceleration ?? 0;
    this.deceleration = deceleration ?? 0;
    this.wallSlideMaxFallSpeed = wallSlideMaxFallSpeed ?? 0;
    this.wallClimbSpeed = wallClimbSpeed ?? 0;
    this.wallClimbAcceleration = wallClimbAcceleration ?? 0;

    this.lastEffectTime = -1;
    this.lastWallJumpTime = -1;

    if (jumpSFX) {
      this.jumpSFX = SoundManager.create(jumpSFX, {
        volume: 0.1,
      });
    }
  }

  public toString(): string {
    return Movement.COMPONENT_TYPE;
  }
}
