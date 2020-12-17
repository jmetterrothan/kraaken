import { Component, Entity } from "@src/ECS";

import  Vector2  from '@shared/math/Vector2';

export class Placeable implements Component {
  public static COMPONENT_TYPE = "placeable";

  public target: Entity;
  public origin: Vector2;

  public follow(target: Entity, origin: Vector2): void {
    this.target = target;
    this.origin = new Vector2(origin.x, origin.y);
  }

  public unfollow(): void {
    this.target = undefined;
    this.origin = undefined;
  }

  public toString(): string {
    return Placeable.COMPONENT_TYPE;
  }
}
