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
  public prevJumpDown = false;
  public dash = false;
  public prevDashDown = false;
  public attack = false;
  public prevAttackDown = false;

  public aim: Vector2 = new Vector2(16, -16);

  public gamepadIndex = 0;

  public toString(): string {
    return PlayerInput.COMPONENT_TYPE;
  }
}
