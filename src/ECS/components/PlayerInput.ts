import Component from "@src/ECS/Component";

import { PLAYER_INPUT_COMPONENT } from "@src/ECS/types";

export class PlayerInput implements Component {
  public readonly type: symbol = PLAYER_INPUT_COMPONENT;

  public left: boolean = false;
  public right: boolean = false;
  public up: boolean = false;
  public down: boolean = false;

  public toString(): string {
    return `Player input`;
  }
}
