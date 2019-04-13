import { vec2 } from 'gl-matrix';

import { lerp2 } from '@shared/utility/MathHelpers';

class Vector2 {
  public x: number;
  public y: number;

  constructor(x?: number, y?: number) {
    this.x = x || 0;
    this.y = y || 0;
  }

  add(v: Vector2): Vector2 {
    this.x += v.x;
    this.y += v.y;

    return this;
  }

  addScalar(s: number): Vector2 {
    this.x += s;
    this.y += s;

    return this;
  }

  addVectors(a: Vector2, b: Vector2) {
    this.x = a.x + b.x;
    this.y = a.y + b.y;

    return this;
  }

  addScaledVector(v: Vector2, s: number) {
		this.x += v.x * s;
		this.y += v.y * s;

    return this;
  }

  sub(v: Vector2): Vector2 {
    this.x -= v.x;
    this.y -= v.y;

    return this;
  }

  subScalar(s: number): Vector2  {
    this.x -= s;
    this.y -= s;

    return this;
  }

  subVectors(a: Vector2, b: Vector2): Vector2  {
    this.x = a.x - b.x;
    this.y = a.y - b.y;

    return this;
  }

  multiply(v: Vector2): Vector2 {
    this.x *= v.x;
    this.y *= v.y;

    return this;
  }

  multiplyScalar(s: number): Vector2  {
    this.x *= s;
    this.y *= s;

    return this;
  }

  divide(v: Vector2): Vector2 {
    this.x /= v.x;
    this.y /= v.y;

    return this;
  }

  divideScalar(s: number): Vector2  {
    return this.multiplyScalar(1 / s);
  }

  angle(): number {
    let angle = Math.atan2(this.y, this.x);
    if (angle < 0) angle += 2 * Math.PI;

    return angle;
  }

  distanceTo(v: Vector2): number {
    return Math.sqrt(this.distanceToSquared(v));
  }

  distanceToSquared(v: Vector2): number {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return dx * dx + dy * dy;
  }

  ceil(): Vector2 {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);

    return this;
  }

  floor(): Vector2 {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);

    return this;
  }

  round(): Vector2 {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);

    return this;
  }

  clamp(min: Vector2, max: Vector2): Vector2 {
    this.x = Math.max(min.x, Math.min(max.x, this.x));
    this.y = Math.max(min.y, Math.min(max.y, this.y));
    
    return this;
  }

  clampScalar(min: number, max: number): Vector2 {
    this.x = Math.max(min, Math.min(max, this.x));
    this.y = Math.max(min, Math.min(max, this.y));
    
    return this;
  }

  negate(): Vector2 {
    this.x = -this.x;
    this.y = -this.y;

    return this;
  }
  
  dot(v: Vector2): number {
    return this.x * v.x + this.y * v.y;
  }

  cross(v: Vector2): number {
    return this.x * v.y - this.y * v.x;
  }

  lengthSquared(): number {
    return this.x * this.x + this.y * this.y;
  }

  length(): number {
    return Math.sqrt(this.lengthSquared());
  }

  normalize(): Vector2 {
    return this.divideScalar(this.length() || 1);
  }

  lerp(v: Vector2, a: number): Vector2 {
    this.x = lerp2(this.x, v.x, a);
    this.x = lerp2(this.y, v.y, a);

    return this;
  }

  lerpVectors(v1: Vector2, v2: Vector2, a: number): Vector2 {
    return this.subVectors(v2, v1).multiplyScalar(a).add(v1);
  }

  equals(v: Vector2): boolean {
    return v.x === this.x && v.y === this.y;
  }

  notEquals(v: Vector2): boolean {
    return v.x !== this.x || v.y !== this.y;
  }

  setX(x: number) { this.x = x; }

  setY(y: number) { this.y = y; }

  getX(x): number { return x; }

  getY(y): number { return y; }

  toGlArray(): vec2 {
    return vec2.fromValues(this.x, this.y);
  }

  rotateAround(center: Vector2, angle: number): Vector2 {
    const c = Math.cos(angle);
    const s = Math.sin(angle);

    const x = this.x - center.x;
    const y = this.y - center.y;

    this.x = x * c - y * s + center.x;
    this.y = x * s + y * c + center.y;

    return this;
  }

  copy(v: Vector2) {
    this.x = v.x;
    this.y = v.y;

    return this;
  }

  clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }
}

export default Vector2;