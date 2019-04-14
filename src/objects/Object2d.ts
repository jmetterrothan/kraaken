import { mat3 } from "gl-matrix";

import { uuid } from '@shared/utility/Utility';
import Vector2 from "@shared/math/Vector2";

class Object2d
{
  private position: Vector2;
  public _previousPosition: Vector2;

  private uuid: string;
  protected visible: boolean;
  private dirty: boolean;

  protected modelMatrix: mat3;
  private shouldUpdateModelMatrix: boolean;

  private children: Map<string, Object2d>;

  constructor(x: number, y: number) {
    this.position = new Vector2(x, y);
    this._previousPosition = new Vector2(x, y);

    this.uuid = uuid();
    this.visible = true;
    this.dirty = false;

    this.modelMatrix = mat3.create();
    this.shouldUpdateModelMatrix = true;

    this.children = new Map<string, Object2d>();
  }

  update(delta: number) {
    if (this.shouldUpdateModelMatrix) {
      this.modelMatrix = mat3.fromTranslation(mat3.create(), this.position.toGlArray());
      this.shouldUpdateModelMatrix = false;
    }
  
    this.children.forEach(child => child.update(delta));
  }

  render(viewProjectionMatrix: mat3) {
    this.children.forEach(child => child.render(viewProjectionMatrix));
  }

  add(object: Object2d) {
    this.children.set(object.getUUID(), object);
  }

  remove(object: Object2d) {
    this.children.delete(object.getUUID());
  }

  setPosition(x: number, y: number) {
    this.shouldUpdateModelMatrix = this.shouldUpdateModelMatrix || this.position.x !== x || this.position.y !== y;

    this._previousPosition.copy(this.position);

    this.position.x = x;
    this.position.y = y;
  }

  setPositionFromVector2(v: Vector2) { this.setPosition(v.x, v.y); }

  setX(x: number) { this.setPosition(x, this.position.y); }
  setY(y: number) { this.setPosition(this.position.x, y); }

  getX(): number { return this.position.x; }
  getY(): number { return this.position.y; }

  getPosition(): Vector2 { return this.position.clone(); }
  getModelMatrix(): mat3 { return this.modelMatrix; }

  isVisible(): boolean { return this.visible; }

  isDirty(): boolean { return this.dirty; }

  setDirty(b: boolean) {
    this.dirty = b;
  }

  hasChangedPosition(): boolean { return this.position.notEquals(this._previousPosition); }

  toString(): string { return this.uuid; }
  getUUID(): string { return this.uuid; }
}

export default Object2d;