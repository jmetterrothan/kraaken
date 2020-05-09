import { PLAYER_MOVEMENT_COMPONENT } from "@src/objects/ECS/types";
import { Component } from "@src/objects/ECS/Component";

interface IPlayerMovementMetadata {
  initialJumpBoost?: number;
  jumpSpeed?: number;
  speed?: number;
  acceleration?: number;
  deceleration?: number;
}

export class PlayerMovement implements Component {
  public readonly type: string = PLAYER_MOVEMENT_COMPONENT;

  public climbing: boolean = false;
  public falling: boolean = false;
  public jumping: boolean = false;
  public walking: boolean = false;

  public isGrounded: boolean = false;

  public readonly initialJumpBoost: number;
  public readonly jumpSpeed: number;
  public readonly speed: number;
  public readonly acceleration: number;
  public readonly deceleration: number;

  public constructor({ initialJumpBoost, jumpSpeed, speed, acceleration, deceleration }: IPlayerMovementMetadata) {
    this.initialJumpBoost = initialJumpBoost ?? 0;
    this.jumpSpeed = jumpSpeed ?? 0;
    this.speed = speed ?? 0;
    this.acceleration = acceleration ?? 0;
    this.deceleration = deceleration ?? 0;
  }

  public toString(): string {
    return `Player movement`;
  }
}
