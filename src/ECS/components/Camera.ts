import { mat3 } from "gl-matrix";

import { Entity, Component } from "@src/ECS";
import { Position } from "@src/ECS/components";

import Box2 from "@src/shared/math/Box2";
import Vector2 from "@shared/math/Vector2";

import { configSvc } from "@src/shared/services/ConfigService";

interface ICameraMetadata {
  mode?: CameraMode;
  smoothing?: number;
}

export enum CameraMode {
  POSITION_LOCKING = 0,
  LERP_SMOOTHING = 1,
}

export class Camera implements Component {
  public static COMPONENT_TYPE = "camera";

  public viewMatrix: mat3 = mat3.create();
  public viewMatrixInverse: mat3 = mat3.create();
  public previousPosition: Vector2 = new Vector2();

  public shouldUpdateProjectionMatrix = true;

  public viewBox: Box2 = new Box2();

  public mode: CameraMode = CameraMode.LERP_SMOOTHING;
  public smoothing: number;

  public target: Entity;
  public boundaries: Box2;

  public zoom: number = configSvc.scale;

  public constructor({ mode }: ICameraMetadata) {
    this.mode = mode ?? CameraMode.LERP_SMOOTHING;
    this.smoothing = 0.4;
  }

  public clamp(entity: Entity): void {
    if (!this.boundaries) {
      return;
    }

    const position = entity.getComponent(Position);

    const x1 = this.boundaries.x1 + configSvc.innerSize.w / 2;
    const x2 = this.boundaries.x2 - configSvc.innerSize.w / 2;
    const y1 = this.boundaries.y1 + configSvc.innerSize.h / 2;
    const y2 = this.boundaries.y2 - configSvc.innerSize.h / 2;

    if (position.x < x1) {
      position.x = x1;
    }
    if (position.y < y1) {
      position.y = y1;
    }
    if (position.x > x2) {
      position.x = x2;
    }
    if (position.y > y2) {
      position.y = y2;
    }
  }

  public follow(target: Entity): void {
    this.target = target;
  }

  public unfollow(): void {
    this.target = undefined;
  }

  public toString(): string {
    return Camera.COMPONENT_TYPE;
  }
}
