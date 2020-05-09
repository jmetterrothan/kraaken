import { RIGID_BODY_COMPONENT } from "@src/objects/ECS/types";
import { Component } from "@src/objects/ECS/Component";

import { IVector2 } from "@src/shared/models/event.model";

import Vector2 from "@shared/math/Vector2";

export interface IRigidBodyMetadata {
  direction?: IVector2;
  collide?: boolean;
  gravity?: boolean;
}

export class RigidBody implements Component {
  public readonly type: string = RIGID_BODY_COMPONENT;

  public readonly collide: boolean;
  public readonly gravity: boolean;

  public direction: Vector2 = new Vector2();
  public velocity: Vector2 = new Vector2(0, 0);

  public constructor({ direction, collide, gravity }: IRigidBodyMetadata = {}) {
    this.direction.x = direction?.x ?? 1;
    this.direction.y = direction?.y ?? 1;

    this.collide = collide ?? true;
    this.gravity = gravity ?? true;
  }

  public toString(): string {
    return `RigidBody - dx:${this.direction.x}, dy:${this.direction.y}`;
  }
}
