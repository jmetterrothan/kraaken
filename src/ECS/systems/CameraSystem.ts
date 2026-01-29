import { mat3, vec2 } from "gl-matrix";

import { Entity, System } from "@src/ECS";
import { Position, Camera, CameraMode } from "@src/ECS/components";

import { configSvc } from "@src/shared/services/ConfigService";

export class CameraSystem extends System {
  public constructor() {
    super([Camera.COMPONENT_TYPE, Position.COMPONENT_TYPE]);
  }

  public clamp(entity: Entity): void {
    const position = entity.getComponent(Position);
    const camera = entity.getComponent(Camera);

    camera.clamp(position);
  }

  public updateViewBox(entity: Entity): void {
    const camera = entity.getComponent(Camera);

    if (!mat3.invert(camera.viewMatrixInverse, camera.viewMatrix)) {
      throw new Error(`Inverse is null`);
    }

    const w = configSvc.frameSize.w;
    const h = configSvc.frameSize.h;

    const tl = vec2.transformMat3(vec2.create(), vec2.fromValues(0, 0), camera.viewMatrixInverse);
    const tr = vec2.transformMat3(vec2.create(), vec2.fromValues(w, 0), camera.viewMatrixInverse);
    const bl = vec2.transformMat3(vec2.create(), vec2.fromValues(0, h), camera.viewMatrixInverse);
    const br = vec2.transformMat3(vec2.create(), vec2.fromValues(w, h), camera.viewMatrixInverse);

    const min = vec2.fromValues(Math.min(tl[0], Math.min(tr[0], Math.min(bl[0], br[0]))), Math.min(tl[1], Math.min(tr[1], Math.min(bl[1], br[1]))));
    const max = vec2.fromValues(Math.max(tl[0], Math.max(tr[0], Math.max(bl[0], br[0]))), Math.max(tl[1], Math.max(tr[1], Math.max(bl[1], br[1]))));

    camera.viewBox.setMin(min[0], min[1]);
    camera.viewBox.setMax(max[0], max[1]);
  }

  public updatePosition(entity: Entity, delta: number): void {
    const camera = entity.getComponent(Camera);
    const position = entity.getComponent(Position);

    // Follow target
    if (camera.target) {
      const targetPos = camera.target.getComponent(Position);

      if (targetPos) {
        if (camera.mode === CameraMode.LERP_SMOOTHING) {
          const t = 1 - Math.pow(1 - camera.smoothing, delta * 60);
          position.lerp(targetPos, t);
        } else {
          position.copy(targetPos);
        }
      }
    }

    this.clamp(entity);

    this.computeProjectionMatrix(entity, delta);

    camera.previousPosition.copy(position);
  }

  computeProjectionMatrix(entity: Entity, delta: number): void {
    const position = entity.getComponent(Position);
    const camera = entity.getComponent(Camera);

    const { xPx, yPx } = camera.shake.update(delta);

    if (camera.shouldUpdateProjectionMatrix || position.notEquals(camera.previousPosition) || Math.abs(camera.zoom - configSvc.scale) > 1e-6 || xPx > 0 || yPx > 0) {
      // update zoom level
      camera.zoom = configSvc.scale;

      const halfW = configSvc.frameSize.w / 2;
      const halfH = configSvc.frameSize.h / 2;

      // get shake in pixels, convert to world units
      const shakeWorldX = xPx / camera.zoom;
      const shakeWorldY = yPx / camera.zoom;

      mat3.identity(camera.viewMatrix);
      mat3.translate(camera.viewMatrix, camera.viewMatrix, vec2.fromValues(halfW, halfH));
      mat3.scale(camera.viewMatrix, camera.viewMatrix, vec2.fromValues(camera.zoom, camera.zoom));
      mat3.translate(camera.viewMatrix, camera.viewMatrix, vec2.fromValues(-(position.x + shakeWorldX), -(position.y + shakeWorldY)));

      this.updateViewBox(entity);

      camera.fixBleedingEdges();

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
    });
  }
}
