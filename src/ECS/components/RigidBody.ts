import { Component } from "@src/ECS";

import Vector2 from "@src/shared/math/Vector2";

import { IVector2 } from "@src/shared/models/event.model";

export interface IRigidBodyMetadata {
  velocity?: IVector2;
  direction?: IVector2;
  orientation?: IVector2;
  collide?: boolean;
  gravity?: boolean;
  maxFallSpeed?: number;
  clampToMap?: boolean;
  bounciness?: number;
  reflect?: boolean;
  reflectAngle?: boolean;
  reflectVFX?: string;
}

export class RigidBody implements Component {
  public static COMPONENT_TYPE = "rigid_body";

  public readonly collide: boolean;
  public readonly gravity: boolean;
  public readonly maxFallSpeed: number;
  public readonly clampToMap: boolean;
  public readonly reflect: boolean;
  public readonly reflectAngle: boolean;
  public readonly reflectVFX: string | null;
  public readonly bounciness: number;

  public orientation: Vector2 = new Vector2(1, 1);
  public direction: Vector2 = new Vector2(1, 1);
  public velocity: Vector2 = new Vector2(0, 0);
  public previousVelocity: Vector2 = new Vector2(0, 0);
  public velocityModifier: Vector2 = new Vector2(1, 1);

  public isGrounded: boolean;

  public constructor({ velocity, direction, collide, gravity, maxFallSpeed, clampToMap, bounciness, reflect, reflectAngle, reflectVFX }: IRigidBodyMetadata = {}) {
    this.velocity.x = velocity?.x ?? 0;
    this.velocity.y = velocity?.y ?? 0;

    this.direction.x = direction?.x ?? 1;
    this.direction.y = direction?.y ?? 1;

    this.collide = collide ?? true;
    this.gravity = gravity ?? true;
    this.maxFallSpeed = maxFallSpeed ?? 900;
    this.clampToMap = clampToMap ?? false;
    this.reflect = reflect ?? false;
    this.reflectAngle = reflectAngle ?? false;
    this.reflectVFX = reflectVFX ?? null;
    this.bounciness = bounciness ?? 1;

    this.isGrounded = false;
  }

  public toString(): string {
    return RigidBody.COMPONENT_TYPE;
  }
}
