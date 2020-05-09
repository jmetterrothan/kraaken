import { BOUNDING_BOX_COMPONENT } from "@src/ECS/types";
import { Component } from "@src/ECS/Component";

import Box2 from "@src/shared/math/Box2";

interface IBoundingBoxMetadata {
  width?: number;
  height?: number;
}

export class BoundingBox extends Box2 implements Component {
  public readonly type: string = BOUNDING_BOX_COMPONENT;

  public constructor({ width, height }: IBoundingBoxMetadata) {
    super(0, 0, width ?? 1, height ?? 1);
  }

  public toString(): string {
    return `Bounding box - w:${this.width}, h:${this.height}`;
  }
}
