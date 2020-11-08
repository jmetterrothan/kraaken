import { mat3, vec2 } from "gl-matrix";

import Component from "@src/ECS/Component";

import { POSITION_COMPONENT } from "@src/ECS/types";

import Vector2 from "@shared/math/Vector2";

export interface IPositionMetadata {
  x?: number;
  y?: number;
}

export class Position extends Vector2 implements Component {
  public readonly type: symbol = POSITION_COMPONENT;

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
    return `Position - ${super.toString()}`;
  }
}
