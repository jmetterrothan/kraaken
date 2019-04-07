import { mat3, vec2 } from 'gl-matrix';

import Object2d from '@src/Object2d';

class Box2d extends Object2d
{
  private width: number;
  private height: number;
  private offsetLeft: number;
  private offsetTop: number;

  constructor(x: number = 0, y: number = 0, w: number = 1, h: number = 1) {
    super(vec2.fromValues(x, y));

    this.width = w;
    this.height = h;

    this.offsetLeft = 0;
    this.offsetTop = 0;

    this.updateModelMatrix();
  }

  updateModelMatrix(): void {
    this.modelMatrix = mat3.fromTranslation(mat3.create(), vec2.fromValues(Math.trunc(this.x1 - this.offsetLeft), Math.trunc(this.y1 - this.offsetTop)));
  }

  collisionWithBox(b: Box2d) {
    return Box2d.collisionWithBox(this, b);
  }

  collisionWithPoint(x: number, y: number) {
    return Box2d.collisionWithPoint(this, x, y);
  }

  setWidth(w: number) {
    this.width = w;
  }

  setHeight(h: number) {
    this.height = h;
  }

  getCenter(): vec2 {
    return vec2.fromValues(this.x1 + this.width / 2, this.y1 + this.height / 2);
  }

  get x1() { return this.position[0]; }
  get y1() { return this.position[1]; }

  set x1(x: number) { this.position[0] = x; }
  set y1(y: number) { this.position[1] = y; }

  get x2() { return this.position[0] + this.width; }
  get y2() { return this.position[1] + this.height; }

  static collisionWithBox(a: Box2d, b: Box2d): boolean {     
    if( (b.x1 >= a.x2) ||
      (b.x2 <= a.x1) ||
      (b.y1 >= a.y2) ||
      (b.y2 <= a.y1) ){
      return false;
    }

    return true;
  }

  static collisionWithPoint(a: Box2d, x: number, y: number): boolean {
    if( x >= a.x1 &&
      x <= a.x2 &&
      y >= a.y1 &&
      y <= a.y2 ){
      return true;
    }
    return false;
  }
}

export default Box2d;