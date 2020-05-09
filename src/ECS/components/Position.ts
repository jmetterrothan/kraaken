import { mat3 } from "gl-matrix";

import { POSITION_COMPONENT } from "@src/ECS/types";
import { Component } from "@src/ECS/Component";

import Vector2 from "@shared/math/Vector2";

export interface IPositionMetadata {
  x?: number;
  y?: number;
}

export class Position extends Vector2 implements Component {
  public readonly type: string = POSITION_COMPONENT;

  public transform: mat3 = mat3.create();
  public previousValue: Vector2 = new Vector2();

  private _shouldUpdateTransform: boolean = true;

  public constructor({ x, y }: IPositionMetadata = {}) {
    super(x ?? 0, y ?? 0);
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
