import { Component } from "@src/ECS";

import Vector2 from "@src/shared/math/Vector2";

export class PlayerInput implements Component {
  public static COMPONENT_TYPE = "player_input";

  public left = false;
  public right = false;
  public up = false;
  public down = false;
  public hold = false;

  public jump = false;
  public prevJump = false;
  public jumpPressed = false;

  public dash = false;
  public prevDash = false;
  public dashPressed = false;

  public attack = false;
  public prevAttack = false;
  public attackPressed = false;

  public aim: Vector2 = new Vector2(16, -16);

  public gamepadIndex = 0;

  public toString(): string {
    return PlayerInput.COMPONENT_TYPE;
  }
}
