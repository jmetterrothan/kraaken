import Vector2 from "@shared/math/Vector2";

import { linesIntersectionWithVector2 } from "@src/shared/utility/MathHelpers";

class Box2 {
  private _min: Vector2;
  private _max: Vector2;

  constructor(x: number = 0, y: number = 0, w: number = 1, h: number = 1) {
    this._min = new Vector2(x - w / 2, y - h / 2);
    this._max = new Vector2(x + w / 2, y + h / 2);
  }

  public containsBox(box: Box2): boolean {
    return this._min.x <= box._min.x && box._max.x <= this._max.x && this._min.y <= box._min.y && box._max.y <= this._max.y;
  }

  public containsPoint(point: Vector2): boolean {
    return point.x < this._min.x || point.x > this._max.x || point.y < this._min.y || point.y > this._max.y ? false : true;
  }

  public intersectBox(box: Box2): boolean {
    return box._max.x < this._min.x || box._min.x > this._max.x || box._max.y < this._min.y || box._min.y > this._max.y ? false : true;
  }

  public intersectSegment(v1: Vector2, v2: Vector2): Vector2 | undefined {
    const p1 = linesIntersectionWithVector2(v1, v2, new Vector2(this._min.x, this._min.y), new Vector2(this._min.x, this._max.y));
    if (p1 !== undefined) {
      // console.log("intersected box left side");
      return p1;
    }
    const p2 = linesIntersectionWithVector2(v1, v2, new Vector2(this._max.x, this._min.y), new Vector2(this._max.x, this._max.y));
    if (p2 !== undefined) {
      // console.log("intersected box right side");
      return p2;
    }
    const p3 = linesIntersectionWithVector2(v1, v2, new Vector2(this._min.x, this._min.y), new Vector2(this._max.x, this._min.y));
    if (p3 !== undefined) {
      // console.log("intersected box top side");
      return p3;
    }
    const p4 = linesIntersectionWithVector2(v1, v2, new Vector2(this._min.x, this._max.y), new Vector2(this._max.x, this._max.y));
    if (p4 !== undefined) {
      // console.log("intersected box bottom side");
      return p4;
    }

    return;
  }

  public setPosition(x: number, y: number) {
    const hw = this.width / 2;
    const hh = this.height / 2;

    this._min.x = x - hw;
    this._min.y = y - hh;
    this._max.x = x + hw;
    this._max.y = y + hh;
  }

  public getPosition(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  public setPositionFromVector2(v: Vector2) {
    this.setPosition(v.x, v.y);
  }

  public setMin(x: number, y: number) {
    this._min.x = x;
    this._min.y = y;
  }

  public setMax(x: number, y: number) {
    this._max.x = x;
    this._max.y = y;
  }

  public getMin(): Vector2 {
    return this._min.clone();
  }
  public getMax(): Vector2 {
    return this._max.clone();
  }

  public get width(): number {
    return this._max.x - this._min.x;
  }
  public get height(): number {
    return this._max.y - this._min.y;
  }

  public get x1(): number {
    return this._min.x;
  }

  public get x2(): number {
    return this._max.x;
  }

  public get y1(): number {
    return this._min.y;
  }

  public get y2(): number {
    return this._max.y;
  }

  public get x(): number {
    return this._min.x + this.width / 2;
  }

  public get y(): number {
    return this._min.y + this.height / 2;
  }

  public clone(): Box2 {
    return new Box2(this.x, this.y, this.width, this.height);
  }
}

export default Box2;
