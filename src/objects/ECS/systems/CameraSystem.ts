import { mat3, vec2 } from "gl-matrix";

import { CAMERA_COMPONENT, POSITION_COMPONENT, MOVEMENT_COMPONENT } from "@src/objects/ECS/types";
import { System, Entity } from "@src/objects/ECS";
import { Position, Camera, CameraMode, Movement } from "@src/objects/ECS/components";

import { configSvc } from "@shared/services/config.service";

export class CameraSystem extends System {
  public constructor() {
    super([CAMERA_COMPONENT, POSITION_COMPONENT]);
  }

  public clamp(entity: Entity) {
    const camera = entity.getComponent<Camera>(CAMERA_COMPONENT);

    if (!camera.boundaries) {
      return;
    }

    const position = entity.getComponent<Position>(POSITION_COMPONENT);

    const x1 = camera.boundaries.x1 + configSvc.innerSize.w / 2;
    const x2 = camera.boundaries.x2 - configSvc.innerSize.w / 2;
    const y1 = camera.boundaries.y1 + configSvc.innerSize.h / 2;
    const y2 = camera.boundaries.y2 - configSvc.innerSize.h / 2;

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

  public updateViewBox(entity: Entity) {
    const camera = entity.getComponent<Camera>(CAMERA_COMPONENT);

    camera.projectionMatrixInverse = mat3.invert(mat3.create(), camera.projectionMatrix);

    const tl = vec2.transformMat3(vec2.create(), vec2.fromValues(0, 0), camera.projectionMatrixInverse);
    const tr = vec2.transformMat3(vec2.create(), vec2.fromValues(configSvc.frameSize.w, 0), camera.projectionMatrixInverse);
    const bl = vec2.transformMat3(vec2.create(), vec2.fromValues(0, configSvc.frameSize.h), camera.projectionMatrixInverse);
    const br = vec2.transformMat3(vec2.create(), vec2.fromValues(configSvc.frameSize.w, configSvc.frameSize.h), camera.projectionMatrixInverse);

    const min = vec2.fromValues(Math.min(tl[0], Math.min(tr[0], Math.min(bl[0], br[0]))), Math.min(tl[1], Math.min(tr[1], Math.min(bl[1], br[1]))));
    const max = vec2.fromValues(Math.max(tl[0], Math.max(tr[0], Math.max(bl[0], br[0]))), Math.max(tl[1], Math.max(tr[1], Math.max(bl[1], br[1]))));

    camera.viewBox.setMin(min[0], min[1]);
    camera.viewBox.setMax(max[0], max[1]);
  }

  public updatePosition(entity: Entity, delta: number) {
    const camera = entity.getComponent<Camera>(CAMERA_COMPONENT);
    const position = entity.getComponent<Position>(POSITION_COMPONENT);

    camera.previousPosition.copy(position);

    // Follow target
    if (camera.target) {
      const targetPos = camera.target.getComponent<Position>(POSITION_COMPONENT);

      if (targetPos) {
        const center = targetPos.clone().trunc();

        if (camera.mode === CameraMode.LERP_SMOOTHING) {
          // const movement = camera.target.getComponent<Movement>(MOVEMENT_COMPONENT);
          // if (!movement || movement.isGrounded) {
          position.lerp(targetPos, camera.smoothing).trunc();
          // }
        } else {
          position.copy(center);
        }
      }
    }

    this.clamp(entity);
  }

  computeProjectionMatrix(entity: Entity) {
    const position = entity.getComponent<Position>(POSITION_COMPONENT);
    const camera = entity.getComponent<Camera>(CAMERA_COMPONENT);

    if (camera.shouldUpdateProjectionMatrix || position.notEquals(camera.previousPosition) || camera.zoom !== configSvc.scale) {
      // update zoom level
      camera.zoom = configSvc.scale;

      const positionMatrix = mat3.create();
      const offsetMatrix = mat3.create();
      const scaleMatrix = mat3.create();

      mat3.fromTranslation(offsetMatrix, vec2.fromValues(Math.trunc(configSvc.innerSize.w / 2), Math.trunc(configSvc.innerSize.h / 2)));
      mat3.fromTranslation(positionMatrix, position.clone().trunc().negate().toGlArray());

      mat3.fromScaling(scaleMatrix, [camera.zoom, camera.zoom]);

      mat3.multiply(camera.projectionMatrix, mat3.create(), scaleMatrix);
      mat3.multiply(camera.projectionMatrix, camera.projectionMatrix, positionMatrix);
      mat3.multiply(camera.projectionMatrix, camera.projectionMatrix, offsetMatrix);

      this.updateViewBox(entity);

      camera.shouldUpdateProjectionMatrix = false;
    }
  }

  execute(delta: number): void {
    const entities = this.world.getEntities(this.componentTypes);
    if (entities.length === 0) {
      return;
    }

    entities.forEach((entity) => {
      this.updatePosition(entity, delta);
      this.computeProjectionMatrix(entity);
    });
  }
}
