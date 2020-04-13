import { mat3 } from "gl-matrix";

import Vector2 from "@src/shared/math/Vector2";

import { ISpriteRenderParameters } from "./animation.model";

export interface ITileTypes {
  [key: string]: ITileTypeData;
}

export interface ITileMapLayers {
  layer1: (0 | 1)[];
  layer2: number[];
  layer3: number[];
}

export interface ITileMapData {
  rows: number;
  cols: number;
  tileSize: number;
  tileSet: string;
  tileTypes: ITileTypes;
  layers: ITileMapLayers;
}

export interface ITileTypeData {
  key: string;
  row: number;
  col: number;
  group: string;
}

export interface ITile {
  type: {
    key: string;
    collision: boolean;
    row: number;
    col: number;
    group: string;
  };
  model: mat3;
  position: Vector2;
  parameters: ISpriteRenderParameters;
}
