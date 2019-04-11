import { mat3, vec3, vec2 } from "gl-matrix";

import { uuid } from '@shared/utility/Utility';
import Vector2 from "@shared/math/Vector2";

class Object2d
{
  private position: Vector2;
  private _previousPosition: Vector2;

  private uuid: string;
  protected visible: boolean;

  protected modelMatrix: mat3;
  private shouldUpdateModelMatrix: boolean;

  constructor(x: number, y: number) {
    this.position = new Vector2(x, y);
    this._previousPosition = new Vector2();

    this.uuid = uuid();
    this.visible = true;

    this.modelMatrix = mat3.create();
    this.shouldUpdateModelMatrix = true;
  }

  update(delta: number) {
    if (this.shouldUpdateModelMatrix) {
      this.updateModelMatrix();
    }
  }

  updateModelMatrix() {
    this.modelMatrix = mat3.fromTranslation(mat3.create(), this.position.toGlArray());
    this.shouldUpdateModelMatrix = false;
    console.log(`${this.uuid} | pos`);
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

  hasChangedPosition(): boolean { return !this.position.equals(this._previousPosition); }

  toString(): string { return this.uuid; }
}

export default Object2d;