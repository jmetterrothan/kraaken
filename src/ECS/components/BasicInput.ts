import { Component } from "@src/ECS";

export class BasicInput implements Component {
  public static COMPONENT_TYPE = "basic_input";

  public left = false;
  public right = false;
  public up = false;
  public down = false;

  public speed = 200;

  public gamepadIndex = 0;

  public toString(): string {
    return BasicInput.COMPONENT_TYPE;
  }
}
