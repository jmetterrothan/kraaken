import { vec2, mat3 } from "gl-matrix";

import Object2d from "@src/Object2d";
import Box2d from "@src/Box2d";
import { lerp } from '@shared/utility/MathHelpers';

import { configSvc } from "./shared/services/config.service";

class Camera extends Object2d
{
  private viewMatrix: mat3;
  private viewMatrixInverse: mat3;

  private viewBox: Box2d;

  private target: Object2d;

  constructor() {
    super(vec2.create());

    this.viewMatrix = mat3.create();
    this.viewMatrixInverse = mat3.create();

    this.viewBox = new Box2d();

    this.visible = false;
  }

  follow(target: Object2d) {
    this.target = target;

    this.recenter();
  }

  recenter(point?: vec2) {
    let center = point;
    if (!point) {
      center = this.target.getCenter();
    }

    this.position[0] = center[0];
    this.position[1] = center[1];
  }

  clamp(boundaries: Box2d) {
    const bx1 = boundaries.x1 + configSvc.innerSize.w / 2;
    const bx2 = boundaries.x2 - configSvc.innerSize.w / 2;
    const by1 = boundaries.y1 + configSvc.innerSize.h / 2;
    const by2 = boundaries.y2 - configSvc.innerSize.h / 2;

    if (this.position[0] < bx1) {
        this.position[0] = bx1;
    }
    if (this.position[1] < by1) {
        this.position[1] = by1;
    }
    if (this.position[0] > bx2) {
        this.position[0] = bx2;
    }
    if (this.position[1] > by2) {
        this.position[1] = by2;
    }
  }

  updateViewBox() {
    const tl = vec2.create();
    const tr = vec2.create();
    const bl = vec2.create();
    const br = vec2.create();
    
    this.viewMatrixInverse = mat3.invert(mat3.create(), this.viewMatrix);

    vec2.transformMat3(tl, vec2.fromValues(0, 0), this.viewMatrixInverse);
    vec2.transformMat3(tr, vec2.fromValues(configSvc.innerSize.w, 0), this.viewMatrixInverse); 
    vec2.transformMat3(bl, vec2.fromValues(0, configSvc.innerSize.h), this.viewMatrixInverse);
    vec2.transformMat3(br, vec2.fromValues(configSvc.innerSize.w, configSvc.innerSize.h), this.viewMatrixInverse);

    const min = vec2.fromValues(Math.min(tl[0], Math.min(tr[0], Math.min(bl[0], br[0]))), Math.min(tl[1], Math.min(tr[1], Math.min(bl[1], br[1]))));
    const max = vec2.fromValues(Math.max(tl[0], Math.max(tr[0], Math.max(bl[0], br[0]))), Math.max(tl[1], Math.max(tr[1], Math.max(bl[1], br[1]))));

    this.viewBox.x1 = min[0];
    this.viewBox.y1 = min[1];
    this.viewBox.setWidth(max[0] - min[0]);
    this.viewBox.setHeight(max[1] - min[1]);
  }

  update(delta: number) {
    // Follow target
    if (this.target) {
      const center = this.target.getCenter();

      this.position[0] = Math.trunc(lerp(this.position[0], center[0], 0.075));
      this.position[1] = Math.trunc(lerp(this.position[0], center[1], 0.075));
    }

    const position = mat3.create();
    const offset = mat3.create();
    const zoom = mat3.create();
    
    mat3.fromTranslation(offset, vec2.fromValues(Math.trunc(configSvc.innerSize.w / 2), Math.trunc(configSvc.innerSize.h / 2)));
    mat3.fromTranslation(position, vec2.fromValues(-this.position[0], -this.position[1]));
    mat3.fromScaling(zoom, [ configSvc.scale, configSvc.scale ]);
    
    mat3.multiply(this.viewMatrix, mat3.create(), zoom);
    mat3.multiply(this.viewMatrix, this.viewMatrix, position);
    mat3.multiply(this.viewMatrix, this.viewMatrix, offset);
  }

  screenToCameraCoords(coords: vec2): vec2 {
    return vec2.transformMat3(vec2.create(), coords, this.viewMatrixInverse);
  }

  getViewMatrix(): mat3 {
    return this.viewMatrix;
  }
}

export default Camera;