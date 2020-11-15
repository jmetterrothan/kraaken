import { mat3 } from "gl-matrix";

import Vector2 from "@src/shared/math/Vector2";

import { ISpriteRenderRenderOptions } from '@shared/models/animation.model';

export enum TileLayer {
  L0 = 1,
  L1 = 2,
  L2 = 3,
}

export interface ITile {
  row: number;
  col: number;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
  index: number;
  position: Vector2;
  size: number;
  direction: Vector2;
  transform: mat3;
  renderOptions: ISpriteRenderRenderOptions;
  hasCollision(): boolean;
  setCollision(b: boolean): void;
  getTileTypeId(layer: TileLayer): number;
  setTileTypeId(layer: TileLayer, id: number): void;
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

export interface ITileTransform {
  layer: number;
  tileType: number;
  row: number;
  col: number; 
  index: number;
}
