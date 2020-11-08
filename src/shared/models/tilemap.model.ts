import { mat3 } from "gl-matrix";

import Vector2 from "@src/shared/math/Vector2";

import { ISpriteRenderParameters } from '@shared/models/animation.model';

export enum TileLayer {
  L0 = 1,
  L1 = 2,
  L2 = 3,
}

export interface ITile {
  row: number;
  col: number;
  index: number;
  position: Vector2;
  size: number;
  direction: Vector2;
  transform: mat3;
  renderOptions: ISpriteRenderParameters;
  hasCollision(): boolean;
  setCollision(b: boolean): void;
  getTileTypeId(layer: TileLayer): number;
  setTileTypeId(layer: TileLayer, id: number): void;
}

export interface ITileMap {
  defaultTileType: number;
  rows: number;
  cols: number;
  tileSize: number;
  tileSet: string;
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

export interface ITileTransform {
  layer: number;
  tileType: number;
  row: number;
  col: number; 
  index: number;
}
