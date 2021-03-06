import { mat3 } from "gl-matrix";

import Component from "@src/ECS/Component";
import { BOUNDING_BOX_COMPONENT } from "@src/ECS/types";

import Color  from '@shared/helper/Color';
import BoundingBoxHelper from "@src/shared/helper/BoundingBoxHelper";

import Box2 from "@src/shared/math/Box2";

interface IBoundingBoxMetadata {
  width?: number;
  height?: number;
}

export class BoundingBox extends Box2 implements Component {
  public readonly type: symbol = BOUNDING_BOX_COMPONENT;

  public helper: BoundingBoxHelper;

  public constructor({ width, height }: IBoundingBoxMetadata) {
    super(0, 0, width ?? 1, height ?? 1);

    this.helper = new BoundingBoxHelper(this, new Color(1.0, 0.5, 0.25, 1.0));
    this.helper.init();
  }

  public render(projectionMatrix: mat3, viewMatrix: mat3, modelMatrix: mat3): void {
    this.helper.use();
    this.helper.render(projectionMatrix, viewMatrix, modelMatrix);
  }

  public toString(): string {
    return `Bounding box - w:${this.width}, h:${this.height}`;
  }
}
