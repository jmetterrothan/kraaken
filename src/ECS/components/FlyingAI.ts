import World from "@src/world/World";

import { Component, Entity } from "@src/ECS";
import { Position } from "@src/ECS/components";
import Vector2 from "@src/shared/math/Vector2";

const RAYCAST_STEPS_NB = 32;

export enum FlyingAIBehavior {
  SEEK = "seek",
  TURRET = "turret",
  PATROL = "patrol",
}

type IFlyingAIMetadata = {
  stopRadius?: number;
  acceleration?: number;
  deceleration?: number;
  speed?: number;
  detectionRadius?: number;
  behavior?: FlyingAIBehavior;
};

export class FlyingAI implements Component {
  public static COMPONENT_TYPE = "flying_ai";

  public lastVisionCheck: number = 0;
  public isSeeingTarget: boolean = false;
  public target: Entity | null = null;

  public hoverStartedAt: number = 0;
  public hoverFollow = 8;
  public hoverSpeed = 0.2;

  public homePos: Vector2 | null = null;

  public readonly acceleration: number;
  public readonly deceleration: number;
  public readonly speed: number;
  public readonly stopRadius: number;
  public readonly detectionRadius: number;
  public readonly behavior: FlyingAIBehavior;

  public constructor({ stopRadius, acceleration, deceleration, speed, detectionRadius, behavior }: IFlyingAIMetadata) {
    this.acceleration = acceleration ?? 0;
    this.deceleration = deceleration ?? 0;
    this.speed = speed ?? 0;
    this.stopRadius = stopRadius ?? 0;
    this.detectionRadius = detectionRadius ?? 0;
    this.behavior = behavior ?? FlyingAIBehavior.TURRET;
  }

  public follow(entity: Entity): void {
    this.target = entity;
  }

  public unfollow(): void {
    this.target = null;
  }

  public hasTarget(target: Entity): boolean {
    return this.target === target;
  }

  public canSeeObject(world: World, entity: Entity, collision: boolean = false): boolean {
    if (this.target) {
      const position = entity.getComponent(Position);
      const targetPos = this.target.getComponent(Position);

      const temp = position.clone();

      if (targetPos.distanceTo(temp) > this.detectionRadius) {
        return false;
      }

      if (collision) {
        const step = targetPos.clone().sub(temp).divideScalar(RAYCAST_STEPS_NB);

        // raycast
        for (let i = 0, n = RAYCAST_STEPS_NB; i < n; i++) {
          const tile = world.tileMap.getTileAtCoords(temp.x, temp.y);

          if (!tile || tile.hasCollision()) {
            return false;
          }

          temp.add(step);
        }
      }

      return true;
    }

    return false;
  }

  public toString(): string {
    return FlyingAI.COMPONENT_TYPE;
  }
}
