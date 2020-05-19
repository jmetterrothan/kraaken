import Component from "@src/ECS/Component";

import { RIGID_BODY_COMPONENT } from "@src/ECS/types";

import Vector2 from "@shared/math/Vector2";

import { IVector2 } from "@src/shared/models/event.model";

export interface IRigidBodyMetadata {
  velocity?: IVector2;
  direction?: IVector2;
  collide?: boolean;
  gravity?: boolean;
  clamToMap?: boolean;
  bounciness?: number;
  reflect?: boolean;
  reflectAngle?: boolean;
}

export class RigidBody implements Component {
  public readonly type: symbol = RIGID_BODY_COMPONENT;

  public readonly collide: boolean;
  public readonly gravity: boolean;
  public readonly clamToMap: boolean;
  public readonly reflect: boolean;
  public readonly reflectAngle: boolean;
  public readonly bounciness: number;

  public direction: Vector2 = new Vector2();
  public velocity: Vector2 = new Vector2(0, 0);

  public constructor({ velocity, direction, collide, gravity, clamToMap, bounciness, reflect, reflectAngle }: IRigidBodyMetadata = {}) {
    this.velocity.x = velocity?.x ?? 0;
    this.velocity.y = velocity?.y ?? 0;

    this.direction.x = direction?.x ?? 1;
    this.direction.y = direction?.y ?? 1;

    this.collide = collide ?? true;
    this.gravity = gravity ?? true;
    this.clamToMap = clamToMap ?? false;
    this.reflect = reflect ?? false;
    this.reflectAngle = reflectAngle ?? false;
    this.bounciness = bounciness ?? 1;
  }

  public toString(): string {
    return `RigidBody - dx:${this.direction.x}, dy:${this.direction.y}`;
  }
}
