import { vec2, mat3 } from "gl-matrix";

import Object2d from "@src/Object2d";
import Box2 from "@src/shared/math/Box2";

import { lerp } from '@shared/utility/MathHelpers';
import { configSvc } from "@shared/services/config.service";
import Vector2 from "@shared/math/Vector2";

class Camera extends Object2d
{
  private projectionMatrix: mat3;
  private projectionMatrixInverse: mat3;

  private viewBox: Box2;
  private shouldUpdateProjectionMatrix: boolean;

  private target: Object2d;

  private previousPosition: Vector2;

  constructor() {
    super(0, 0);

    this.projectionMatrix = mat3.create();
    this.projectionMatrixInverse = mat3.create();

    this.viewBox = new Box2();
    this.shouldUpdateProjectionMatrix = true;

    this.visible = false;

    this.previousPosition = new Vector2();
  }

  follow(target: Object2d) {
    this.target = target;

    this.recenter();
  }

  recenter(point?: Vector2) {
    let center = point;
    if (!point) {
      center = this.target.getPosition();
    }

    this.position.copy(center);

    this.shouldUpdateProjectionMatrix = true;
  }

  clamp(boundaries: Box2) {
    const x1 = boundaries.getMinX() + configSvc.innerSize.w / 2;
    const x2 = boundaries.getMaxX() - configSvc.innerSize.w / 2;
    const y1 = boundaries.getMinY() + configSvc.innerSize.h / 2;
    const y2 = boundaries.getMaxY() - configSvc.innerSize.h / 2;

    if (this.position.x < x1) {
        this.position.x = x1;
    }
    if (this.position.y < y1) {
        this.position.y = y1;
    }
    if (this.position.x > x2) {
        this.position.x = x2;
    }
    if (this.position.y > y2) {
        this.position.y = y2;
    }
  }

  updateViewBox() {
    this.projectionMatrixInverse = mat3.invert(mat3.create(), this.projectionMatrix);

    const tl = vec2.transformMat3(vec2.create(), vec2.fromValues(0, 0), this.projectionMatrixInverse);
    const tr = vec2.transformMat3(vec2.create(), vec2.fromValues(configSvc.frameSize.w, 0), this.projectionMatrixInverse);
    const bl = vec2.transformMat3(vec2.create(), vec2.fromValues(0, configSvc.frameSize.h), this.projectionMatrixInverse);
    const br = vec2.transformMat3(vec2.create(), vec2.fromValues(configSvc.frameSize.w, configSvc.frameSize.h), this.projectionMatrixInverse);

    const min = vec2.fromValues(Math.min(tl[0], Math.min(tr[0], Math.min(bl[0], br[0]))), Math.min(tl[1], Math.min(tr[1], Math.min(bl[1], br[1]))));
    const max = vec2.fromValues(Math.max(tl[0], Math.max(tr[0], Math.max(bl[0], br[0]))), Math.max(tl[1], Math.max(tr[1], Math.max(bl[1], br[1]))));

    this.viewBox.setMin(min[0], min[1]);
    this.viewBox.setMax(max[0], max[1]);
  }

  update(delta: number) {
    // Follow target
    if (this.target) {
      const center: Vector2 = this.target.getPosition();

      this.position.x = Math.trunc(lerp(this.position.x, center.x, 0.075));
      this.position.y = Math.trunc(lerp(this.position.y, center.y, 0.075));
    }

    if (!this.position.equals(this.previousPosition)) {
      this.shouldUpdateProjectionMatrix = true;
    }

    this.previousPosition.copy(this.position);
    
    if (this.shouldUpdateProjectionMatrix) {
      const position = mat3.create();
      const offset = mat3.create();
      const zoom = mat3.create();
      
      mat3.fromTranslation(offset, vec2.fromValues(configSvc.innerSize.w / 2, configSvc.innerSize.h / 2));
      mat3.fromTranslation(position, this.position.clone().negate().toGlArray());
      mat3.fromScaling(zoom, [ configSvc.scale, configSvc.scale ]);
      
      mat3.multiply(this.projectionMatrix, mat3.create(), zoom);
      mat3.multiply(this.projectionMatrix, this.projectionMatrix, position);
      mat3.multiply(this.projectionMatrix, this.projectionMatrix, offset);

      this.updateViewBox();
      this.shouldUpdateProjectionMatrix = false;
    }
  }

  isFrustumCulled(object: Object2d): boolean {
    return !this.viewBox.containsPoint(object.getPosition());
  }

  screenToCameraCoords(coords: vec2): vec2 {
    return vec2.transformMat3(vec2.create(), coords, this.projectionMatrixInverse);
  }

  getProjectionMatrix(): mat3 {
    return this.projectionMatrix;
  }
}

export default Camera;