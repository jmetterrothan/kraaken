import { Component, Entity } from "@src/ECS";

import Vector2 from "@src/shared/math/Vector2";

export class Placeable implements Component {
  public static COMPONENT_TYPE = "placeable";

  public target: Entity | null = null;
  public origin: Vector2 | null = null;

  public follow(target: Entity, origin: Vector2): void {
    this.target = target;
    this.origin = new Vector2(origin.x, origin.y);
  }

  public unfollow(): void {
    this.target = null;
    this.origin = null;
  }

  public toString(): string {
    return Placeable.COMPONENT_TYPE;
  }
}
