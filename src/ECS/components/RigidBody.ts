import Component from "@src/ECS/Component";

import { RIGID_BODY_COMPONENT } from "@src/ECS/types";

import Vector2 from "@shared/math/Vector2";

import { IVector2 } from "@src/shared/models/event.model";

export interface IRigidBodyMetadata {
  direction?: IVector2;
  collide?: boolean;
  gravity?: boolean;
}

export class RigidBody implements Component {
  public readonly type: symbol = RIGID_BODY_COMPONENT;

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
