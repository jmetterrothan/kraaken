import { Component } from "@src/ECS";

import Vector2 from "@src/shared/math/Vector2";

export class PlayerInput implements Component {
  public static COMPONENT_TYPE = "player_input";

  public left = false;
  public prevLeft = false;
  public right = false;
  public prevRight = false;
  public up = false;
  public prevUp = false;
  public down = false;
  public prevDown = false;
  public hold = false;
  public prevHold = false;
  public jump = false;
  public prevJump = false;
  public dash = false;
  public prevDash = false;
  public attack = false;
  public prevAttack = false;

  public aim: Vector2 = new Vector2(16, -16);

  public gamepadIndex = 0;

  public get dashPressed(): boolean {
    return this.dash && !this.prevDash;
  }

  public get jumpPressed(): boolean {
    return this.jump && !this.prevJump;
  }

  public get attackPressed(): boolean {
    return this.attack && !this.prevAttack;
  }

  public toString(): string {
    return PlayerInput.COMPONENT_TYPE;
  }
}
