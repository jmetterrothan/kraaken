import Component from "@src/ECS/Component";

import { SPRITE_COMPONENT } from "@src/ECS/types";

import SpriteManager from "@src/animation/SpriteManager";
import SpriteAtlas from "@src/animation/SpriteAtlas";

import Color from "@src/shared/helper/Color";

import { ISpriteRenderParameters } from "@shared/models/animation.model";

interface ISpriteMetadata {
  row?: number;
  col?: number;
  alias?: string;
}

export class Sprite implements Component {
  public readonly type: symbol = SPRITE_COMPONENT;

  public row: number;
  public col: number;

  public atlas: SpriteAtlas;

  public parameters: ISpriteRenderParameters;

  public constructor({ row, col, alias }: ISpriteMetadata) {
    this.row = row ?? 0;
    this.col = col ?? 0;

    if (!alias) {
      throw new Error(`You must provide an alias to the Sprite component`);
    }

    this.atlas = SpriteManager.get(alias);

    this.parameters = {
      flickering: false,
      grayscale: false,
      wireframe: false,
      flashing: false,
      alpha: 1,
      color: new Color(0, 0, 0, 1),
    };
  }

  public toString(): string {
    return `Sprite - ${this.atlas.alias} (r:${this.row}, c:${this.col})`;
  }
}
