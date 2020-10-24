import Component from "@src/ECS/Component";

import { BASIC_INPUT_COMPONENT } from "@src/ECS/types";

export class BasicInput implements Component {
  public readonly type: symbol = BASIC_INPUT_COMPONENT;

  public left = false;
  public right = false;
  public up = false;
  public down = false;

  public speed = 200;

  public gamepadIndex = 0;

  public toString(): string {
    return `Basic input`;
  }
}
