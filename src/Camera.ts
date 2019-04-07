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
  private shouldUpdateViewMatrix: boolean;

  private target: Object2d;

  constructor() {
    super(vec2.create());

    this.viewMatrix = mat3.create();
    this.viewMatrixInverse = mat3.create();

    this.viewBox = new Box2d();
    this.shouldUpdateViewMatrix = true;

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

    this.setPosition(center);

    this.shouldUpdateViewMatrix = true;
  }

  clamp(boundaries: Box2d) {
    const bx1 = boundaries.x + configSvc.innerSize.w / 2;
    const bx2 = boundaries.x2 - configSvc.innerSize.w / 2;
    const by1 = boundaries.y + configSvc.innerSize.h / 2;
    const by2 = boundaries.y2 - configSvc.innerSize.h / 2;

    if (this.x < bx1) {
        this.x = bx1;
    }
    if (this.y < by1) {
        this.y = by1;
    }
    if (this.x > bx2) {
        this.x = bx2;
    }
    if (this.y > by2) {
        this.y = by2;
    }
  }

  updateViewBox() {
    this.viewMatrixInverse = mat3.invert(mat3.create(), this.viewMatrix);

    const tl = vec2.transformMat3(vec2.create(), vec2.fromValues(0, 0), this.viewMatrixInverse);
    const tr = vec2.transformMat3(vec2.create(), vec2.fromValues(configSvc.frameSize.w, 0), this.viewMatrixInverse);
    const bl = vec2.transformMat3(vec2.create(), vec2.fromValues(0, configSvc.frameSize.h), this.viewMatrixInverse);
    const br = vec2.transformMat3(vec2.create(), vec2.fromValues(configSvc.frameSize.w, configSvc.frameSize.h), this.viewMatrixInverse);

    const min = vec2.fromValues(Math.min(tl[0], Math.min(tr[0], Math.min(bl[0], br[0]))), Math.min(tl[1], Math.min(tr[1], Math.min(bl[1], br[1]))));
    const max = vec2.fromValues(Math.max(tl[0], Math.max(tr[0], Math.max(bl[0], br[0]))), Math.max(tl[1], Math.max(tr[1], Math.max(bl[1], br[1]))));

    this.viewBox.x = min[0];
    this.viewBox.y = min[1];
    this.viewBox.setWidth(max[0] - min[0]);
    this.viewBox.setHeight(max[1] - min[1]);

    console.log('updated viewbox')
  }

  update(delta: number) {
    // Follow target
    if (this.target) {
      const center: vec2 = this.target.getCenter();

      this.x = Math.trunc(lerp(this.x, center[0], 0.075));
      this.y = Math.trunc(lerp(this.y, center[1], 0.075));
    }

    if (this.shouldUpdateViewMatrix) {
      const position = mat3.create();
      const offset = mat3.create();
      const zoom = mat3.create();
      
      mat3.fromTranslation(offset, vec2.fromValues(Math.trunc(configSvc.innerSize.w / 2), Math.trunc(configSvc.innerSize.h / 2)));
      mat3.fromTranslation(position, vec2.fromValues(-this.x, -this.y));
      mat3.fromScaling(zoom, [ configSvc.scale, configSvc.scale ]);
      
      mat3.multiply(this.viewMatrix, mat3.create(), zoom);
      mat3.multiply(this.viewMatrix, this.viewMatrix, position);
      mat3.multiply(this.viewMatrix, this.viewMatrix, offset);

      this.updateViewBox();
      this.shouldUpdateViewMatrix = false;
    }
  }

  screenToCameraCoords(coords: vec2): vec2 {
    return vec2.transformMat3(vec2.create(), coords, this.viewMatrixInverse);
  }

  getViewMatrix(): mat3 {
    return this.viewMatrix;
  }
}

export default Camera;