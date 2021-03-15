import { mat3 } from "gl-matrix";

import { Component } from "@src/ECS";

import Color from "@shared/helper/Color";
import BoundingBoxHelper from "@src/shared/helper/BoundingBoxHelper";

import Box2 from "@src/shared/math/Box2";

interface IBoundingBoxMetadata {
  width?: number;
  height?: number;
  debug?: boolean;
}

export class BoundingBox extends Box2 implements Component {
  public static COMPONENT_TYPE = "bounding_box";

  public helper: BoundingBoxHelper;
  public debug: boolean;

  public constructor({ width, height, debug }: IBoundingBoxMetadata) {
    super(0, 0, width ?? 1, height ?? 1);

    this.debug = debug === true;

    this.helper = new BoundingBoxHelper(this, new Color(1.0, 0.5, 0.25, 1.0));
    this.helper.init();
  }

  public render(projectionMatrix: mat3, viewMatrix: mat3, modelMatrix: mat3): void {
    this.helper.use();
    this.helper.render(projectionMatrix, viewMatrix, modelMatrix);
  }

  public toString(): string {
    return BoundingBox.COMPONENT_TYPE;
  }
}
