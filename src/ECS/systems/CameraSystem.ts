import { mat3, vec2 } from "gl-matrix";

import { Entity, System } from "@src/ECS";
import { Position, Camera, RigidBody } from "@src/ECS/components";

import { configSvc } from "@src/shared/services/ConfigService";
import { clamp, expLerpT } from "@src/shared/utility/MathHelpers";

const applyDeadzone = (camX: number, camY: number, focusX: number, focusY: number, dzHalfW: number, dzHalfH: number) => {
  let x = camX;
  let y = camY;

  const dx = focusX - camX;
  const dy = focusY - camY;

  if (dx > dzHalfW) x = focusX - dzHalfW;
  else if (dx < -dzHalfW) x = focusX + dzHalfW;

  if (dy > dzHalfH) y = focusY - dzHalfH;
  else if (dy < -dzHalfH) y = focusY + dzHalfH;

  return { x, y };
};

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

    if (!camera.target) return;

    const targetPos = camera.target.getComponent(Position);

    if (!targetPos) return;

    // --- LOOK-AHEAD (from velocity if available) ---
    let desiredLookPxX = 0;
    let desiredLookPxY = 0;

    if (camera.target.hasComponent("rigid_body")) {
      const rb = camera.target.getComponent(RigidBody);
      desiredLookPxX = clamp(rb.velocity.x * camera.lookAheadVelToPx, -camera.lookAheadMaxPx, camera.lookAheadMaxPx);
      desiredLookPxY = clamp(rb.velocity.y * camera.lookAheadVelToPx, -camera.lookAheadMaxPx, camera.lookAheadMaxPx);
    }

    const zoom = configSvc.scale;
    const desiredLookWorldX = desiredLookPxX / zoom;
    const desiredLookWorldY = desiredLookPxY / zoom;

    const tLook = expLerpT(camera.lookAheadSmoothing, delta);
    camera.lookAhead.x += (desiredLookWorldX - camera.lookAhead.x) * tLook;
    camera.lookAhead.y += (desiredLookWorldY - camera.lookAhead.y) * tLook;

    const focusX = targetPos.x + camera.lookAhead.x;
    const focusY = targetPos.y + camera.lookAhead.y;

    // --- DEADZONE (in world units; deadzone defined as screen fraction) ---
    const dzHalfW = (configSvc.frameSize.w * camera.deadzoneWFrac) / (2 * zoom);
    const dzHalfH = (configSvc.frameSize.h * camera.deadzoneHFrac) / (2 * zoom);

    const desired = applyDeadzone(position.x, position.y, focusX, focusY, dzHalfW, dzHalfH);

    // --- FOLLOW SMOOTHING ---
    const tFollow = expLerpT(camera.smoothing, delta);
    position.x += (desired.x - position.x) * tFollow;
    position.y += (desired.y - position.y) * tFollow;

    // --- SOFT CLAMP to boundaries ---
    // Compute camera min/max center positions based on world bounds + half viewport in world units
    if (camera.boundaries) {
      const halfViewW = configSvc.frameSize.w / (2 * zoom);
      const halfViewH = configSvc.frameSize.h / (2 * zoom);

      const minX = camera.boundaries.x1 + halfViewW;
      const maxX = camera.boundaries.x2 - halfViewW;
      const minY = camera.boundaries.y1 + halfViewH;
      const maxY = camera.boundaries.y2 - halfViewH;

      const clampedX = clamp(position.x, minX, maxX);
      const clampedY = clamp(position.y, minY, maxY);

      // Softly ease into the clamp (no snap)
      const tClamp = expLerpT(camera.clampSmoothing, delta);
      position.x += (clampedX - position.x) * tClamp;
      position.y += (clampedY - position.y) * tClamp;
    }

    this.clamp(entity);

    this.computeProjectionMatrix(entity, delta);

    camera.previousPosition.copy(position);
  }

  computeProjectionMatrix(entity: Entity, delta: number): void {
    const position = entity.getComponent(Position);
    const camera = entity.getComponent(Camera);

    const { xPx, yPx } = camera.shake.update(delta);

    if (camera.shouldUpdateProjectionMatrix || position.notEquals(camera.previousPosition) || Math.abs(camera.zoom - configSvc.scale) > Number.EPSILON || Math.abs(xPx) > Number.EPSILON || Math.abs(yPx) > Number.EPSILON) {
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
