import { mat3, vec2 } from "gl-matrix";

import Entity from "@src/ECS/Entity";
import System from "@src/ECS/System";

import { Position, Camera, CameraMode } from "@src/ECS/components";
import { CAMERA_COMPONENT, POSITION_COMPONENT } from "@src/ECS/types";

import Vector2 from "@shared/math/Vector2";

import { configSvc } from "@src/shared/services/ConfigService";

export class CameraSystem extends System {
  public constructor() {
    super([CAMERA_COMPONENT, POSITION_COMPONENT]);
  }

  public clamp(entity: Entity): void {
    const camera = entity.getComponent<Camera>(CAMERA_COMPONENT);
    camera.clamp(entity);
  }

  public updateViewBox(entity: Entity): void {
    const camera = entity.getComponent<Camera>(CAMERA_COMPONENT);

    camera.viewMatrixInverse = mat3.invert(mat3.create(), camera.viewMatrix);

    const tl = vec2.transformMat3(vec2.create(), vec2.fromValues(0, 0), camera.viewMatrixInverse);
    const tr = vec2.transformMat3(vec2.create(), vec2.fromValues(configSvc.frameSize.w, 0), camera.viewMatrixInverse);
    const bl = vec2.transformMat3(vec2.create(), vec2.fromValues(0, configSvc.frameSize.h), camera.viewMatrixInverse);
    const br = vec2.transformMat3(vec2.create(), vec2.fromValues(configSvc.frameSize.w, configSvc.frameSize.h), camera.viewMatrixInverse);

    const min = vec2.fromValues(Math.min(tl[0], Math.min(tr[0], Math.min(bl[0], br[0]))), Math.min(tl[1], Math.min(tr[1], Math.min(bl[1], br[1]))));
    const max = vec2.fromValues(Math.max(tl[0], Math.max(tr[0], Math.max(bl[0], br[0]))), Math.max(tl[1], Math.max(tr[1], Math.max(bl[1], br[1]))));

    camera.viewBox.setMin(min[0], min[1]);
    camera.viewBox.setMax(max[0], max[1]);
  }

  public updatePosition(entity: Entity, delta: number): void {
    const camera = entity.getComponent<Camera>(CAMERA_COMPONENT);
    const position = entity.getComponent<Position>(POSITION_COMPONENT);

    camera.previousPosition.copy(position);

    // Follow target
    if (camera.target) {
      const targetPos = camera.target.getComponent<Position>(POSITION_COMPONENT);

      if (targetPos) {
        const center = targetPos.clone().trunc();

        if (camera.mode === CameraMode.LERP_SMOOTHING) {
          position.lerp(center, camera.smoothing).trunc();
        } else {
          position.copy(center).trunc();
        }

        Vector2.destroy(center);
      }
    }

    this.clamp(entity);
  }

  computeProjectionMatrix(entity: Entity): void {
    const position = entity.getComponent<Position>(POSITION_COMPONENT);
    const camera = entity.getComponent<Camera>(CAMERA_COMPONENT);

    if (camera.shouldUpdateProjectionMatrix || position.notEquals(camera.previousPosition) || camera.zoom !== configSvc.scale) {
      // update zoom level
      camera.zoom = configSvc.scale;

      const positionMatrix = mat3.create();
      const offsetMatrix = mat3.create();
      const scaleMatrix = mat3.create();

      const translation = position.clone().trunc().negate();
      mat3.fromTranslation(offsetMatrix, vec2.fromValues(Math.trunc(configSvc.innerSize.w / 2), Math.trunc(configSvc.innerSize.h / 2)));
      mat3.fromTranslation(positionMatrix, translation.toGlArray());
      Vector2.destroy(translation);

      mat3.fromScaling(scaleMatrix, [camera.zoom, camera.zoom]);

      mat3.multiply(camera.viewMatrix, mat3.create(), scaleMatrix);
      mat3.multiply(camera.viewMatrix, camera.viewMatrix, positionMatrix);
      mat3.multiply(camera.viewMatrix, camera.viewMatrix, offsetMatrix);

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
