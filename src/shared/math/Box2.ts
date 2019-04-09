import Vector2 from '@shared/math/Vector2';

class Box2
{
  private min: Vector2;
  private max: Vector2;

  constructor(x: number = 0, y: number = 0, w: number = 1, h: number = 1) {
    this.min = new Vector2(x, y);
    this.max = new Vector2(x + w, y + h);
  }

  containsBox(box: Box2): boolean {
    return this.min.x <= box.min.x && box.max.x <= this.max.x && this.min.y <= box.min.y && box.max.y <= this.max.y;
  }

  containsPoint(point: Vector2): boolean {
    return (point.x < this.min.x || point.x > this.max.x || point.y < this.min.y || point.y > this.max.y) ? false : true;
  }

  intersectBox(box: Box2): boolean {
    return (box.max.x < this.min.x || box.min.x > this.max.x || box.max.y < this.min.y || box.min.y > this.max.y) ? false : true;
  }

  setPosition(x: number, y: number) {
    const w = this.getWidth();
    const h = this.getHeight();

    this.min.x = x;
    this.min.y = y;
    this.max.x = x + w;
    this.max.y = y + h;
  }

  setPositionFromCenter(x: number, y: number) {
    const hw = this.getWidth() / 2;
    const hh = this.getHeight() / 2;

    this.min.x = x - hw;
    this.min.y = y - hh;
    this.max.x = x + hw;
    this.max.y = y + hh;
  }

  setMin(x: number, y: number) {
    this.min.x = x;
    this.min.y = y;
  }

  setMax(x: number, y: number) {
    this.max.x = x;
    this.max.y = y;
  }

  getWidth(): number { return this.max.x - this.min.x; }
  getHeight(): number { return this.max.y - this.min.y; }

  getMin(): Vector2 { return this.min.clone(); }
  getMax(): Vector2 { return this.max.clone(); }

  getMinX(): number { return this.min.x; }
  getMaxX(): number { return this.max.x; }
  getMinY(): number { return this.min.y; }
  getMaxY(): number { return this.max.y; }

  getCenter(): Vector2 {
    return new Vector2().addVectors(this.min, this.max).multiplyScalar(0.5);
  }
}

export default Box2;