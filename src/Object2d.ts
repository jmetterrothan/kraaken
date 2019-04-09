import { mat3, vec3, vec2 } from "gl-matrix";

import { uuid } from '@shared/utility/Utility';
import Vector2 from "@shared/math/Vector2";

class Object2d
{
  protected position: Vector2;

  private uuid: string;
  protected visible: boolean;
  protected modelMatrix: mat3;

  constructor(x: number, y: number) {
    this.position = new Vector2(x, y);

    this.uuid = uuid();
    this.visible = true;
    this.modelMatrix = mat3.create();
  }

  updateModelMatrix() {
    this.modelMatrix = mat3.fromTranslation(mat3.create(), this.position.toGlArray());
  }

  setPosition(x: number, y: number) {
    this.position.x = x;
    this.position.y = y;
  }

  getPosition(): Vector2 { return this.position.clone(); }
  getModelMatrix(): mat3 { return this.modelMatrix; }

  isVisible(): boolean { return this.visible; }

  toString(): string { return this.uuid; }
}

export default Object2d;