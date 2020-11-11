import Component from "@src/ECS/Component";

import { SPRITE_COMPONENT } from "@src/ECS/types";

import SpriteManager from "@src/animation/SpriteManager";
import SpriteAtlas from "@src/animation/SpriteAtlas";

import { TintEffect } from '@shared/models/animation.model';
import { ISpriteRenderRenderOptions } from "@shared/models/animation.model";

import Color from "@src/shared/helper/Color";

interface ISpriteMetadata {
  row?: number;
  col?: number;
  alias?: string;
  align?: "bottom" | "center";
  reflect?: boolean;
}

export class Sprite implements Component {
  public readonly type: symbol = SPRITE_COMPONENT;

  public visible = true;

  public row: number;
  public col: number;

  public atlas: SpriteAtlas;

  public align: "bottom" | "center";

  public renderOptions: ISpriteRenderRenderOptions;

  public constructor({ row = 0, col = 0, alias, align = "center", reflect = true }: ISpriteMetadata) {
    this.row = row;
    this.col = col;
    this.align = align;

    if (!alias) {
      throw new Error(`You must provide an alias to the Sprite component`);
    }

    this.atlas = SpriteManager.get(alias);

    this.renderOptions = {
      flickering: false,
      flickerSpeed: 150,
      grayscale: false,
      outline: false,
      tint: {
        color: new Color(1.0, 1.0, 1.0, 1.0).toVec4(),
        effect: TintEffect.NONE,
      },
      reflect,
    };
  }

  public toString(): string {
    return `Sprite - ${this.atlas.alias} (r:${this.row}, c:${this.col})`;
  }
}
