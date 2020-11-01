import { mat3 } from "gl-matrix";

import Vector2 from "@src/shared/math/Vector2";

import { ISpriteRenderParameters } from "./animation.model";

export type ILayerId = 0 | 1 | 2;

export interface ITileMap {
  defaultTileType: number;
  rows: number;
  cols: number;
  tileSize: number;
  tileSet: string;
  tileGroups: ITileTypeGroup[];
  tileTypes: ITileTypeData[];
  layer1: number[];
  layer2: number[];
  layer3: number[];
}

export interface ITileTypeData {
  key?: string;
  row: number;
  col: number;
  group: string;
}

export interface ITileTypeGroup {
  id: string;
  name?: string;
  display?: string;
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
