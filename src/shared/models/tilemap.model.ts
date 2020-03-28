import { mat3 } from "gl-matrix";

import Vector2 from "@src/shared/math/Vector2";
import { ISpriteRenderParameters } from "./animation.model";

export interface ITileMapData {
  rows: number;
  cols: number;
  tileSize: number;
  tileTypes: {
    [key: string]: ITileTypeData;
  };
  tiles: number[];
}

export interface ITileTypeData {
  key: string;
  collision: boolean;
  row: number;
  col: number;
}

export interface ITile {
  type: {
    key: string;
    collision: boolean;
    row: number;
    col: number;
  };
  model: mat3;
  position: Vector2;
  parameters: ISpriteRenderParameters;
}
