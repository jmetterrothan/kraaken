import { mat3 } from 'gl-matrix';

import Vector2 from '@src/shared/math/Vector2';

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
  collision: boolean;
  row: number;
  col: number;
}

export interface ITile {
  type: {
    collision: boolean;
    row: number;
    col: number;
  };
  model: mat3;
  orientation: Vector2;
  position: Vector2;
}
