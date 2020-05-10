import Component from "@src/ECS/Component";

import { FILL_COMPONENT } from "@src/ECS/types";

import Color from "@src/shared/helper/Color";
import ColoredBox from "@src/shared/helper/ColoredBox";

import { IRGBAColorData } from "@shared/models/color.model";
import { ISpriteRenderParameters } from "@shared/models/animation.model";

interface IFillMetadata {
  color?: IRGBAColorData;
}

export class Fill implements Component {
  public readonly type: symbol = FILL_COMPONENT;

  public color: Color;
  public helper: ColoredBox;

  public parameters: ISpriteRenderParameters;

  public constructor({ color = { r: 0, g: 0, b: 0, a: 1 } }: IFillMetadata) {
    this.color = Color.fromRGBData(color);
  }

  public toString(): string {
    return `Fill - (r:${this.color.r}, g:${this.color.g}, b:${this.color.b}, a:${this.color.a})`;
  }
}
