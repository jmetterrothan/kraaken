import Vector2 from "@shared/math/Vector2";
import Box2Helper from "@src/shared/helper/Box2Helper";
import Color from "@src/shared/helper/Color";

class Box2 {
  private min: Vector2;
  private max: Vector2;

  constructor(x: number = 0, y: number = 0, w: number = 1, h: number = 1) {
    this.min = new Vector2(x, y);
    this.max = new Vector2(x + w, y + h);
  }

  public static createFromCenterPoint(x: number, y: number, w: number, h: number): Box2 {
    return new Box2(x - w / 2, y - h / 2, w, h);
  }

  public containsBox(box: Box2): boolean {
    return this.min.x <= box.min.x && box.max.x <= this.max.x && this.min.y <= box.min.y && box.max.y <= this.max.y;
  }

  public containsPoint(point: Vector2): boolean {
    return point.x < this.min.x || point.x > this.max.x || point.y < this.min.y || point.y > this.max.y ? false : true;
  }

  public intersectBox(box: Box2): boolean {
    return box.max.x < this.min.x || box.min.x > this.max.x || box.max.y < this.min.y || box.min.y > this.max.y ? false : true;
  }

  public setPosition(x: number, y: number) {
    const w = this.getWidth();
    const h = this.getHeight();

    this.min.x = x;
    this.min.y = y;
    this.max.x = x + w;
    this.max.y = y + h;
  }

  public setPositionFromCenter(x: number, y: number) {
    const hw = this.getWidth() / 2;
    const hh = this.getHeight() / 2;

    this.min.x = x - hw;
    this.min.y = y - hh;
    this.max.x = x + hw;
    this.max.y = y + hh;
  }

  public setPositionFromCenterVector2(v: Vector2) {
    this.setPositionFromCenter(v.x, v.y);
  }

  public setMin(x: number, y: number) {
    this.min.x = x;
    this.min.y = y;
  }

  public setMax(x: number, y: number) {
    this.max.x = x;
    this.max.y = y;
  }

  public getWidth(): number {
    return this.max.x - this.min.x;
  }
  public getHeight(): number {
    return this.max.y - this.min.y;
  }

  public getMin(): Vector2 {
    return this.min.clone();
  }
  public getMax(): Vector2 {
    return this.max.clone();
  }

  public getMinX(): number {
    return this.min.x;
  }

  public getMaxX(): number {
    return this.max.x;
  }

  public getMinY(): number {
    return this.min.y;
  }

  public getMaxY(): number {
    return this.max.y;
  }

  public getCenterX(): number {
    return this.min.x + this.getWidth() / 2;
  }

  public getCenterY(): number {
    return this.min.y + this.getHeight() / 2;
  }

  public getCenter(): Vector2 {
    return new Vector2(this.getCenterX(), this.getCenterY());
  }

  public createHelper(color: Color = new Color(1, 0, 0)): Box2Helper {
    return new Box2Helper(this, color);
  }

  public clone(): Box2 {
    return new Box2(this.getMinX(), this.getMinY(), this.getWidth(), this.getHeight());
  }
}

export default Box2;
