import { mat3, vec2 } from "gl-matrix";

import Vector2 from "@shared/math/Vector2";
import Entity from "@src/objects/entity/Entity";
import Object2d from "@src/objects/Object2d";
import Box2Helper from "@src/shared/helper/Box2Helper";
import Box2 from "@src/shared/math/Box2";
import World from "@src/world/World";

import { configSvc } from "@shared/services/config.service";
import { lerp } from "./shared/utility/MathHelpers";

class Camera extends Object2d {
  private projectionMatrix: mat3;
  private projectionMatrixInverse: mat3;
  private shouldUpdateProjectionMatrix: boolean;

  private viewBox: Box2;

  private target: Object2d;
  private zoom: number;
  private dampingFactor: number;

  constructor() {
    super(0, 0);

    this.projectionMatrix = mat3.create();
    this.projectionMatrixInverse = mat3.create();
    this.shouldUpdateProjectionMatrix = true;

    this.viewBox = new Box2();

    this.visible = false;
    this.zoom = 1;
    this.dampingFactor = 0.25;
  }

  public follow(target: Object2d) {
    this.target = target;

    this.recenter();
  }

  public recenter(point?: Vector2) {
    let center = point;
    if (!point) {
      center = this.target.getPosition();
    }

    this.setPositionFromVector2(center.trunc());
    this.shouldUpdateProjectionMatrix = true;
  }

  public updateViewBox() {
    this.projectionMatrixInverse = mat3.invert(
      mat3.create(),
      this.projectionMatrix
    );

    const tl = vec2.transformMat3(
      vec2.create(),
      vec2.fromValues(0, 0),
      this.projectionMatrixInverse
    );
    const tr = vec2.transformMat3(
      vec2.create(),
      vec2.fromValues(configSvc.frameSize.w, 0),
      this.projectionMatrixInverse
    );
    const bl = vec2.transformMat3(
      vec2.create(),
      vec2.fromValues(0, configSvc.frameSize.h),
      this.projectionMatrixInverse
    );
    const br = vec2.transformMat3(
      vec2.create(),
      vec2.fromValues(configSvc.frameSize.w, configSvc.frameSize.h),
      this.projectionMatrixInverse
    );

    const min = vec2.fromValues(
      Math.min(tl[0], Math.min(tr[0], Math.min(bl[0], br[0]))),
      Math.min(tl[1], Math.min(tr[1], Math.min(bl[1], br[1])))
    );
    const max = vec2.fromValues(
      Math.max(tl[0], Math.max(tr[0], Math.max(bl[0], br[0]))),
      Math.max(tl[1], Math.max(tr[1], Math.max(bl[1], br[1])))
    );

    this.viewBox.setMin(min[0], min[1]);
    this.viewBox.setMax(max[0], max[1]);

    // console.log(`${this.toString()} | viewbox matrix`);
  }

  public clamp(boundaries: Box2) {
    const x1 = boundaries.getMinX() + configSvc.innerSize.w / 2;
    const x2 = boundaries.getMaxX() - configSvc.innerSize.w / 2;
    const y1 = boundaries.getMinY() + configSvc.innerSize.h / 2;
    const y2 = boundaries.getMaxY() - configSvc.innerSize.h / 2;

    if (this.getX() < x1) {
      this.setX(x1);
    }
    if (this.getY() < y1) {
      this.setY(y1);
    }
    if (this.getX() > x2) {
      this.setX(x2);
    }
    if (this.getY() > y2) {
      this.setY(y2);
    }
  }

  public update(world: World, delta: number) {
    // Follow target
    if (this.target) {
      const center: Vector2 = this.target.getPosition();

      const dist = center.sub(this.getPosition());
      const v = dist
        .multiplyScalar(this.zoom * this.dampingFactor)
        .multiplyScalar(delta)
        .trunc();

      this.setPosition(this.getX() + v.x, this.getY() + v.y);

      /*
      this.setPosition(
        lerp(this.getX(), Math.floor(center.x), delta),
        lerp(this.getY(), Math.floor(center.y), delta)
      );
      */

      this.clamp(world.getBoundaries());
    }

    this.shouldUpdateProjectionMatrix =
      this.shouldUpdateProjectionMatrix || this.hasChangedPosition();

    if (this.shouldUpdateProjectionMatrix) {
      this.zoom = configSvc.scale;

      const position = mat3.create();
      const offset = mat3.create();
      const scale = mat3.create();

      mat3.fromTranslation(
        offset,
        vec2.fromValues(
          Math.trunc(configSvc.innerSize.w / 2),
          Math.trunc(configSvc.innerSize.h / 2)
        )
      );
      mat3.fromTranslation(
        position,
        this.getPosition()
          .negate()
          .toGlArray()
      );
      mat3.fromScaling(scale, [this.zoom, this.zoom]);

      mat3.multiply(this.projectionMatrix, mat3.create(), scale);
      mat3.multiply(this.projectionMatrix, this.projectionMatrix, position);
      mat3.multiply(this.projectionMatrix, this.projectionMatrix, offset);

      this.updateViewBox();
    }
  }

  public isFrustumCulled(object: Entity | Box2Helper | Object2d): boolean {
    if (
      object instanceof Box2Helper &&
      this.viewBox.intersectBox((object as Box2Helper).getBox2())
    ) {
      return false;
    }

    if (
      object instanceof Entity &&
      this.viewBox.intersectBox((object as Entity).getBbox())
    ) {
      return false;
    }

    return !this.viewBox.containsPoint(object.getPosition());
  }

  public screenToCameraCoords(coords: vec2): Vector2 {
    const v = vec2.transformMat3(
      vec2.create(),
      coords,
      this.projectionMatrixInverse
    );
    return new Vector2(v[0], v[1]);
  }

  public getProjectionMatrix(): mat3 {
    return this.projectionMatrix;
  }
}

export default Camera;
