import { vec2 } from "gl-matrix";

import Lifo from "@shared/utility/Lifo";
import { lerp, lerp2 } from "@shared/utility/MathHelpers";

let ok;
setInterval(() => {
  if (ok !== Vector2.instances.length) {
    console.log(Vector2.instances.length);
    ok = Vector2.instances.length;
  }
}, 1000 / 60);

class Vector2 {
  public static instances: Lifo<Vector2> = new Lifo();

  public x: number;
  public y: number;

  public static create(x?: number, y?: number): Vector2 {
    const v = Vector2.instances.pop();
    if (typeof v !== "undefined") {
      v.x = x;
      v.y = y;
      return v;
    }
    return new Vector2(x, y);
  }

  public static destroy(v: Vector2) {
    Vector2.instances.push(v);
  }

  constructor(x?: number, y?: number) {
    this.x = x || 0;
    this.y = y || 0;
  }

  public add(v: Vector2): Vector2 {
    this.x += v.x;
    this.y += v.y;

    return this;
  }

  public addValues(x: number, y: number): Vector2 {
    this.x += x;
    this.y += y;

    return this;
  }

  public addScalar(s: number): Vector2 {
    this.x += s;
    this.y += s;

    return this;
  }

  public addVectors(a: Vector2, b: Vector2) {
    this.x = a.x + b.x;
    this.y = a.y + b.y;

    return this;
  }

  public addScaledVector(v: Vector2, s: number) {
    this.x += v.x * s;
    this.y += v.y * s;

    return this;
  }

  public sub(v: Vector2): Vector2 {
    this.x -= v.x;
    this.y -= v.y;

    return this;
  }

  public subScalar(s: number): Vector2 {
    this.x -= s;
    this.y -= s;

    return this;
  }

  public subVectors(a: Vector2, b: Vector2): Vector2 {
    this.x = a.x - b.x;
    this.y = a.y - b.y;

    return this;
  }

  public multiply(v: Vector2): Vector2 {
    this.x *= v.x;
    this.y *= v.y;

    return this;
  }

  public multiplyScalar(s: number): Vector2 {
    this.x *= s;
    this.y *= s;

    return this;
  }

  public divide(v: Vector2): Vector2 {
    this.x /= v.x;
    this.y /= v.y;

    return this;
  }

  public divideScalar(s: number): Vector2 {
    return this.multiplyScalar(1 / s);
  }

  public angle(): number {
    let angle = Math.atan2(this.y, this.x);
    if (angle < 0) {
      angle += 2 * Math.PI;
    }

    return angle;
  }

  public distanceTo(v: Vector2): number {
    return Math.sqrt(this.distanceToSquared(v));
  }

  public distanceToSquared(v: Vector2): number {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return dx * dx + dy * dy;
  }

  public ceil(): Vector2 {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);

    return this;
  }

  public floor(): Vector2 {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);

    return this;
  }

  public round(): Vector2 {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);

    return this;
  }

  public trunc(): Vector2 {
    this.x = Math.trunc(this.x);
    this.y = Math.trunc(this.y);

    return this;
  }

  public clamp(min: Vector2, max: Vector2): Vector2 {
    this.x = Math.max(min.x, Math.min(max.x, this.x));
    this.y = Math.max(min.y, Math.min(max.y, this.y));

    return this;
  }

  public clampScalar(min: number, max: number): Vector2 {
    this.x = Math.max(min, Math.min(max, this.x));
    this.y = Math.max(min, Math.min(max, this.y));

    return this;
  }

  public negate(): Vector2 {
    this.x = -this.x;
    this.y = -this.y;

    return this;
  }

  public abs(): Vector2 {
    this.x = Math.abs(this.x);
    this.y = Math.abs(this.y);

    return this;
  }

  public dot(v: Vector2): number {
    return this.x * v.x + this.y * v.y;
  }

  public cross(v: Vector2): number {
    return this.x * v.y - this.y * v.x;
  }

  public lengthSquared(): number {
    return this.x * this.x + this.y * this.y;
  }

  public length(): number {
    return Math.sqrt(this.lengthSquared());
  }

  public normalize(): Vector2 {
    return this.divideScalar(this.length() || 1);
  }

  public lerp(v: Vector2, a: number): Vector2 {
    this.x = lerp(this.x, v.x, a);
    this.y = lerp(this.y, v.y, a);

    return this;
  }

  public lerp2(v: Vector2, a: number): Vector2 {
    this.x = lerp2(this.x, v.x, a);
    this.y = lerp2(this.y, v.y, a);

    return this;
  }

  public lerpVectors(v1: Vector2, v2: Vector2, a: number): Vector2 {
    return this.subVectors(v2, v1).multiplyScalar(a).add(v1);
  }

  public equals(v: Vector2): boolean {
    return v.x === this.x && v.y === this.y;
  }

  public notEquals(v: Vector2): boolean {
    return v.x !== this.x || v.y !== this.y;
  }

  public fromValues(x: number, y: number) {
    this.x = x;
    this.y = y;

    return this;
  }

  public toGlArray(): vec2 {
    return vec2.fromValues(this.x, this.y);
  }

  public rotateAround(center: Vector2, angle: number): Vector2 {
    const c = Math.cos(angle);
    const s = Math.sin(angle);

    const x = this.x - center.x;
    const y = this.y - center.y;

    this.x = x * c - y * s + center.x;
    this.y = x * s + y * c + center.y;

    return this;
  }

  public copy(v: Vector2) {
    this.x = v.x;
    this.y = v.y;

    return this;
  }

  public clone(): Vector2 {
    return Vector2.create(this.x, this.y);
  }

  public setX(x: number): Vector2 {
    this.x = x;

    return this;
  }

  public setY(y: number): Vector2 {
    this.y = y;

    return this;
  }

  reflect(n: Vector2): Vector2 {
    // vector - 2 * Vector2.Dot(vector, normal) * normal;
    const dotProduct = this.dot(n);

    const temp = n.clone().multiplyScalar(dotProduct * 2);
    const output = this.clone().sub(temp);

    Vector2.destroy(temp);

    return output;
  }

  public toFixed(precision: number) {
    const n = 10 ** precision;
    this.x = Math.floor(this.x * n) / n;
    this.y = Math.floor(this.y * n) / n;

    return this;
  }

  public toString(): string {
    return `x:${this.x}, y:${this.y}`;
  }
}

export default Vector2;
