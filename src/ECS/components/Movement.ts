import { Component } from "@src/ECS";

import SoundManager from "@src/animation/SoundManager";

interface IMovementMetadata {
  initialJumpBoost?: number;
  jumpSpeed?: number;
  coyoteTimeMs?: number;
  speed?: number;
  acceleration?: number;
  deceleration?: number;
  wallSlideMaxFallSpeed?: number;
  wallClimbSpeed?: number;
  wallClimbAcceleration?: number;
  jumpSFX?: string;
  jumpVFX?: string;
  landVFX?: string;
  landHardVFX?: string;
  runTrailVFX?: string;
}

export class Movement implements Component {
  public static COMPONENT_TYPE = "movement";

  public wallSliding = false;
  public wallClimbing = false;
  public falling = false;
  public jumping = false;
  public walking = false;
  public idle = true;
  public climbedDuringAirborne = false;

  public airborneSince: number | null = null;
  public wasGrounded: boolean;

  public isBlockedLeft = false;
  public isBlockedRight = false;
  public isBlockedUp = false;
  public isBlockedDown = false;

  public readonly initialJumpBoost: number;
  public readonly jumpSpeed: number;
  public readonly coyoteTimeMs: number;
  public readonly speed: number;
  public readonly acceleration: number;
  public readonly deceleration: number;
  public readonly wallSlideMaxFallSpeed: number;
  public readonly wallClimbSpeed: number;
  public readonly wallClimbAcceleration: number;
  public readonly jumpSFX?: Howl;
  public readonly jumpVFX?: string;
  public readonly landVFX?: string;
  public readonly landHardVFX?: string;
  public readonly runTrailVFX?: string;

  public lastEffectTime: number;
  public lastWallJumpTime: number;
  public jumpBufferMs: number;
  public jumpBufferRemainingMs: number;
  public coyoteRemainingMs: number;
  public prevJumpDown: boolean;

  public constructor({ initialJumpBoost, jumpSpeed, coyoteTimeMs, speed, acceleration, deceleration, wallSlideMaxFallSpeed, wallClimbSpeed, wallClimbAcceleration, jumpSFX, jumpVFX, landVFX, landHardVFX, runTrailVFX }: IMovementMetadata) {
    this.initialJumpBoost = initialJumpBoost ?? 0;
    this.jumpSpeed = jumpSpeed ?? 0;
    this.coyoteTimeMs = coyoteTimeMs ?? 0;
    this.speed = speed ?? 0;
    this.acceleration = acceleration ?? 0;
    this.deceleration = deceleration ?? 0;
    this.wallSlideMaxFallSpeed = wallSlideMaxFallSpeed ?? 0;
    this.wallClimbSpeed = wallClimbSpeed ?? 0;
    this.wallClimbAcceleration = wallClimbAcceleration ?? 0;
    this.wallClimbAcceleration = wallClimbAcceleration ?? 0;
    this.wallClimbAcceleration = wallClimbAcceleration ?? 0;
    this.jumpVFX = jumpVFX;
    this.landVFX = landVFX;
    this.landHardVFX = landHardVFX;
    this.runTrailVFX = runTrailVFX;

    this.lastEffectTime = -1;
    this.lastWallJumpTime = -1;
    this.jumpBufferMs = 100;
    this.jumpBufferRemainingMs = 0;
    this.coyoteRemainingMs = 0;
    this.prevJumpDown = false;
    this.wasGrounded = true;

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
