import { mat3 } from "gl-matrix";

import Vector2 from "@src/shared/math/Vector2";

import { ISpriteRenderRenderOptions } from "@src/shared/models/animation.model";

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
  f: number;
  g: number;
  h: number;
  cost: number;
  visited: boolean;
  closed: boolean;
  parent: ITile | null;
  hasCollision(): boolean;
  setCollision(b: boolean): void;
  getTileTypeId(layerId: number): number;
  setTileTypeId(layerId: number, tileTypeId: number): void;
}

export const isTile = (value: unknown): value is ITile => {
  return typeof value === "object" && value !== null && "row" in value && "col" in value;
};

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
  layerId: number;
  tileTypeId: number;
  row: number;
  col: number;
  index: number;
}
