import { mat3 } from "gl-matrix";

import Vector2 from "@src/shared/math/Vector2";

import { ISpriteRenderParameters } from "./animation.model";

export interface ITileGroups {
  [key: string]: {
    display?: "2x2" | "3x3" | "4x2" | "4x4";
    name: string;
  };
}

export type ILayerId = 0 | 1 | 2;

export interface ITileMap {
  defaultTileType: number;
  rows: number;
  cols: number;
  tileSize: number;
  tileSet: string;
  tileGroups: ITileGroups;
  tileTypes: ITileTypeData[];
  layer1: number[];
  layer2: number[];
  layer3: number[];
}

export interface ITileTypeData {
  key: string;
  row: number;
  col: number;
  group: string;
}

export interface ITileTypeGroup {
  id: string;
  name: string;
  display: "2x2" | "3x3" | "4x4" | null;
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
