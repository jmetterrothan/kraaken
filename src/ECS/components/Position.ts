import { mat3 } from "gl-matrix";

import { Component } from "@src/ECS";

import Vector2 from "@shared/math/Vector2";

export interface IPositionMetadata {
  x?: number;
  y?: number;
}

export class Position extends Vector2 implements Component {
  public static COMPONENT_TYPE = "position";

  public rotation = 0;

  public transform: mat3 = mat3.create();
  public previousValue: Vector2 = new Vector2();

  private _shouldUpdateTransform = true;

  public constructor({ x = 0, y = 0 }: IPositionMetadata = {}) {
    super(x, y);
  }

  public get shouldUpdateTransform(): boolean {
    return this._shouldUpdateTransform || this.notEquals(this.previousValue);
  }

  public set shouldUpdateTransform(b: boolean) {
    this._shouldUpdateTransform = this._shouldUpdateTransform || b;
  }

  public toString(): string {
    return Position.COMPONENT_TYPE;
  }
}
