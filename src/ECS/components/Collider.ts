import { Component } from "@src/ECS";

export class Collider implements Component {
  public static COMPONENT_TYPE = "collider";

  public toString(): string {
    return Collider.COMPONENT_TYPE;
  }
}
