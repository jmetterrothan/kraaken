import { mat3, vec2, vec3 } from "gl-matrix";

import Vector2 from "@src/shared/math/Vector2";

import { ITileTypeData } from "@src/shared/models/tilemap.model";
import { ISpriteRenderParameters } from "@shared/models/animation.model";

interface TileOptions {
  collision?: boolean;
  wireframe?: boolean;
  grayscale?: boolean;
  flickering?: boolean;
  alpha?: number;
  direction?: Vector2;
}

class Tile {
  public activeSlot: 1 | 2;
  public readonly row: number;
  public readonly col: number;
  public readonly size: number;
  public readonly position: Vector2;
  public readonly model: mat3;

  public renderOptions: ISpriteRenderParameters;

  private _collision: boolean;
  private _slot1: ITileTypeData;
  private _slot2: ITileTypeData;

  constructor(row: number, col: number, size: number, collision: boolean, options: TileOptions = {}) {
    this.row = row;
    this.col = col;
    this.size = size;
    this.collision = collision;

    this.model = mat3.fromTranslation(mat3.create(), vec2.fromValues(col * size, row * size));

    this.position = new Vector2(col * size, row * size);

    this.activeSlot = 1;

    this.renderOptions = {
      fill: false,
      wireframe: false,
      grayscale: false,
      flickering: false,
      alpha: 1,
      color: vec3.fromValues(1, 0, 0),
      direction: new Vector2(1, 1),
      ...options,
    };
  }

  private setSlot(layerId: number, type: ITileTypeData) {
    this[`_slot${layerId}`] = type;

    if (layerId === 1) {
      this.collision = !this.isSlotEmpty(1);
    }
  }

  private getSlot(layerId: number): ITileTypeData | undefined {
    return this[`_slot${layerId}`];
  }

  private isSlotEmpty(layerId: number): boolean {
    return !this[`_slot${layerId}`] || this[`_slot${layerId}`].key === "void";
  }

  public get x1(): number {
    return this.position.x;
  }

  public get x2(): number {
    return this.position.x + this.size;
  }

  public get y1(): number {
    return this.position.y;
  }

  public get y2(): number {
    return this.position.y + this.size;
  }

  public get slot1(): ITileTypeData | undefined {
    return this._slot1;
  }

  public set slot1(type: ITileTypeData) {
    this.setSlot(1, type);
  }

  public get slot2(): ITileTypeData | undefined {
    return this._slot2;
  }

  public set slot2(type: ITileTypeData) {
    this.setSlot(2, type);
  }

  public get slot(): ITileTypeData | undefined {
    return this.getSlot(this.activeSlot);
  }

  public set slot(type: ITileTypeData) {
    this.setSlot(this.activeSlot, type);
  }

  public get empty(): boolean {
    return this.isSlotEmpty(this.activeSlot);
  }

  public get collision(): boolean {
    return this._collision;
  }

  public set collision(b: boolean) {
    this._collision = b;
  }
}

export default Tile;
