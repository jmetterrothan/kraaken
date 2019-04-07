import { mat3, vec3, vec2 } from "gl-matrix";

import { uuid } from '@shared/utility/Utility';

class Object2d
{
  protected position: vec2;

  private uuid: string;
  protected visible: boolean;
  protected modelMatrix: mat3;

  constructor(position: vec2) {
    this.position = position;

    this.uuid = uuid();
    this.visible = true;
    this.modelMatrix = mat3.create();
  }

  update(delta: number) {
    this.updateModelMatrix();
  }

  updateModelMatrix() {
    this.modelMatrix = mat3.fromTranslation(mat3.create(), this.position);
  }

  getCenter(): vec2 {
    return this.position;
  }

  getModelMatrix(): mat3 {
    return this.modelMatrix;
  }

  toString(): string {
    return this.uuid;
  }
}

export default Object2d;