import { mat3, vec3, vec2 } from "gl-matrix";

import { uuid } from '@shared/utility/Utility';

class Object2d
{
  private position: vec2;
  private previousPosition: vec2;

  private uuid: string;
  protected visible: boolean;
  protected modelMatrix: mat3;

  constructor(position: vec2) {
    this.setPosition(position);

    this.uuid = uuid();
    this.visible = true;
    this.modelMatrix = mat3.create();
  }

  updateModelMatrix() {
    this.modelMatrix = mat3.fromTranslation(mat3.create(), this.position);
  }

  setPosition(pos: vec2) {
    this.previousPosition = this.position;

    this.position = pos;
  }

  setPositionFromValues(x: number, y: number) {
    this.previousPosition = this.position;
  
    this.position[0] = x;
    this.position[1] = y;
  }

  getPosition(): vec2 { return this.position; }
  getPreviousPosition(): vec2 { return this.previousPosition; }
  getCenter(): vec2 { return this.position; }
  getModelMatrix(): mat3 { return this.modelMatrix; }

  toString(): string { return this.uuid; }

  get x() { return this.position[0]; }
  get y() { return this.position[1]; }

  set x(x: number) { this.setPositionFromValues(x, this.position[1]); }
  set y(y: number) { this.setPositionFromValues(this.position[0], y); }
}

export default Object2d;