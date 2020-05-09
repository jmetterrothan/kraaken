import { mat3, vec2, vec3 } from "gl-matrix";

import Vector2 from "@src/shared/math/Vector2";
import Color from "@src/shared/helper/Color";

import { ITileTypeData } from "@src/shared/models/tilemap.model";
import { ISpriteRenderParameters } from "@shared/models/animation.model";

interface TileOptions {
  collision?: boolean;
  wireframe?: boolean;
  grayscale?: boolean;
  flickering?: boolean;
  alpha?: number;
}

class Tile {
  public activeSlot: 0 | 1 | 2;
  public readonly row: number;
  public readonly col: number;
  public readonly size: number;
  public readonly position: Vector2;
  public readonly transform: mat3;

  public direction?: Vector2;
  public renderOptions: ISpriteRenderParameters;

  private _collision: boolean;
  private _slot1: ITileTypeData;
  private _slot2: ITileTypeData;

  constructor(row: number, col: number, size: number, collision: boolean, options: TileOptions = {}) {
    this.row = row;
    this.col = col;
    this.size = size;
    this.collision = collision;

    this.transform = mat3.fromTranslation(mat3.create(), vec2.fromValues(col * size, row * size));

    this.position = new Vector2(col * size, row * size);
    this.direction = new Vector2(1, 1);

    this.activeSlot = 1;

    this.renderOptions = {
      wireframe: false,
      grayscale: false,
      flickering: false,
      alpha: 1,
      color: new Color(0.5, 0.25, 0.75),
      ...options,
    };
  }

  private setSlot(layerId: number, type: ITileTypeData) {
    this[`_slot${layerId}`] = type;
  }

  public getSlot(layerId: number): ITileTypeData | undefined {
    return this[`_slot${layerId}`];
  }

  public isSlotEmpty(layerId: number): boolean {
    return !this[`_slot${layerId}`];
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

  public get typeId(): string | undefined {
    return this.slot ? `${this.slot.row}:${this.slot.col}` : undefined;
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
