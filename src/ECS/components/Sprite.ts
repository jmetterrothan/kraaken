import { mat3, vec2 } from "gl-matrix";

import { Component } from "@src/ECS";

import SpriteManager from "@src/animation/SpriteManager";
import SpriteAtlas from "@src/animation/SpriteAtlas";

import { TintEffect } from '@shared/models/animation.model';
import { ISpriteRenderRenderOptions } from "@shared/models/animation.model";

import Vector2 from '@shared/math/Vector2';
import Color from "@src/shared/helper/Color";

interface ISpriteMetadata {
  row?: number;
  col?: number;
  alias?: string;
  align?: "bottom" | "center";
  reflect?: boolean;
  offset?: Vector2;
}

export class Sprite implements Component {
  public static COMPONENT_TYPE = "sprite";

  public visible = true;

  public index: number;
  public atlas: SpriteAtlas;

  public align: "bottom" | "center";
  public offset: Vector2;

  public renderOptions: ISpriteRenderRenderOptions;

  public constructor({ row = -1, col = -1, alias, align = "center", reflect = true, offset = new Vector2(0, 0) }: ISpriteMetadata) {
    this.align = align;
    this.offset = offset;

    if (!alias) {
      throw new Error(`You must provide an alias to the Sprite component`);
    }

    this.atlas = SpriteManager.get(alias);
    this.index = this.atlas.getIndex(row, col);

    this.renderOptions = {
      flickering: false,
      flickerSpeed: 150,
      grayscale: false,
      outline: false,
      outlineColor: new Color(1.0, 1.0, 1.0, 1.0).toVec4(),
      tintColor: new Color(1.0, 1.0, 1.0, 1.0).toVec4(),
      tintEffect: TintEffect.NONE,
      reflect,
    };
  }

  public render(projectionMatrix: mat3, viewMatrix: mat3, modelMatrix: mat3, direction: Vector2 | undefined): void {
    this.atlas.use();
    this.atlas.render(projectionMatrix, viewMatrix, modelMatrix, this.index, direction, this.renderOptions);
  }

  public toString(): string {
    return Sprite.COMPONENT_TYPE;
  }
}
