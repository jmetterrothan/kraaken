import  Entity  from '@src/ECS/Entity';
import Component from "@src/ECS/Component";

import  Vector2  from '@shared/math/Vector2';

import { PLACEABLE_COMPONENT } from "../types";

export class Placeable implements Component {
  public readonly type: symbol = PLACEABLE_COMPONENT;

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
    return `Placeable`;
  }
}
