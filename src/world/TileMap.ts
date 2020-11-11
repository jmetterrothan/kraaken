import { mat3, vec2 } from "gl-matrix";

import { Position } from "@src/ECS/components";
import { POSITION_COMPONENT } from "@src/ECS/types";

import SpriteAtlas from "@src/animation/SpriteAtlas";
import SpriteManager from "@src/animation/SpriteManager";
import World from "@src/world/World";

import { IWorldBlueprint } from '@shared/models/world.model';
import { TintEffect } from "@src/shared/models/animation.model";
import { TileLayer, ITile, ITileTypeData } from "@shared/models/tilemap.model";

import Box2 from "@shared/math/Box2";
import Color from "@shared/helper/Color";
import Vector2  from '@shared/math/Vector2';
import { create2DArray } from "@shared/utility/Utility";

import { configSvc } from "@shared/services/ConfigService";

import config from '@src/config';

class TileMap {
  private startCol: number;
  private startRow: number;
  private endCol: number;
  private endRow: number;

  public tiles: ITile[][];
  public atlas: SpriteAtlas;

  private tileTypes: Record<number, ITileTypeData>;
  private boundaries: Box2;

  private readonly nbCols: number;
  private readonly nbRows: number;

  private readonly tileSize: number;
  private readonly tileSet: string;

  private readonly sizeX: number;
  private readonly sizeY: number;

  constructor(blueprint: IWorldBlueprint) {
    this.nbCols = blueprint.level.tileMapCols;
    this.nbRows = blueprint.level.tileMapRows;
    this.tileSize = blueprint.level.tileSize;
    this.tileSet = blueprint.level.tileSet;

    this.sizeX = this.nbCols * this.tileSize;
    this.sizeY = this.nbRows * this.tileSize;

    this.boundaries = new Box2(this.sizeX / 2, this.sizeY / 2, this.sizeX, this.sizeY);

    this.atlas = SpriteManager.get(this.tileSet);

    this.tileTypes = blueprint.level.tileTypes.reduce((acc, tileType) => {
      const index = tileType.row * this.atlas.nbCols + tileType.col;
      acc[index] = tileType;
      return acc;
    }, {});

    this.tiles = create2DArray<ITile>(this.nbRows, this.nbCols);
   
    for (let r = 0; r < this.nbRows; r++) {
      for (let c = 0; c < this.nbCols; c++) {
        const tile: ITile = {
          row: r,
          col: c,
          index: r * this.nbCols + c,
          transform: mat3.fromTranslation(mat3.create(), vec2.fromValues(c * this.tileSize, r * this.tileSize)),
          position: new Vector2(c * this.tileSize, r * this.tileSize),
          size: this.tileSize,
          direction: new Vector2(1, 1),
          renderOptions: {
            grayscale: false,
            flickering: false,
            flickerSpeed: 250,
            tint: {
              color: new Color(1.0, 1.0, 1.0, 1.0).toVec4(),
              effect: TintEffect.NONE,
            },
            reflect: false,
          },
          hasCollision: () => {
            return blueprint.level.layers[TileLayer.L0][r * this.nbCols + c] === 1;
          },
          setCollision: (b) => {
            blueprint.level.layers[TileLayer.L1][r * this.nbCols + c] = b ? 1 : 0;
          },
          getTileTypeId: (layer) => {
            return blueprint.level.layers[layer][r * this.nbCols + c];
          },
          setTileTypeId: (layer, id) => {
            if (layer === TileLayer.L1) {
              blueprint.level.layers[TileLayer.L0][r * this.nbCols + c] = id > 0 ? 1 : 0;
            }
            blueprint.level.layers[layer][r * this.nbCols + c] = id;
          },
        };

        this.tiles[r][c] = tile;
      }
    }
  }

  public init(): void {
    
  }

  public update(world: World, delta: number): void {
    const center = world.camera.getComponent<Position>(POSITION_COMPONENT);

    this.startCol = Math.floor((center.x - configSvc.innerSize.w / 2) / this.tileSize);
    this.startRow = Math.floor((center.y - configSvc.innerSize.h / 2) / this.tileSize);
    this.endCol = Math.ceil((center.x + configSvc.innerSize.w / 2) / this.tileSize);
    this.endRow = Math.ceil((center.y + configSvc.innerSize.h / 2) / this.tileSize);

    if (this.startCol < 0) {
      this.startCol = 0;
    }
    if (this.startRow < 0) {
      this.startRow = 0;
    }
    if (this.endCol >= this.nbCols) {
      this.endCol = this.nbCols - 1;
    }
    if (this.endRow >= this.nbRows) {
      this.endRow = this.nbRows - 1;
    }
  }

  public render(projectionMatrix: mat3, viewMatrix: mat3, alpha: number): void {
    this.atlas.use();

    for (let r = this.startRow; r <= this.endRow; r++) {
      for (let c = this.startCol; c <= this.endCol; c++) {
        const tile = this.tiles[r][c];

        const layer1Index = tile.getTileTypeId(TileLayer.L1);
        const layer2Index = tile.getTileTypeId(TileLayer.L2);

        if (config.DEBUG && tile.hasCollision() && layer1Index === 0) {
          this.atlas.render(projectionMatrix, viewMatrix, tile.transform, { row: 0, col: 0 }, tile.direction, tile.renderOptions);
        }

        if (layer1Index > 0 && this.tileTypes[layer1Index]) {
           this.atlas.render(projectionMatrix, viewMatrix, tile.transform, this.tileTypes[layer1Index], tile.direction, tile.renderOptions);
        }

        if (layer2Index > 0 && this.tileTypes[layer2Index]) {
          this.atlas.render(projectionMatrix, viewMatrix, tile.transform, this.tileTypes[layer2Index], tile.direction, tile.renderOptions);
       }
      }
    }
  }

  public floodFill(originRow: number, originCol: number, predicate: (tile?: ITile) => boolean): any[] {
    const stack = [];

    const fn = (row: number, col: number) => {
      const index = col * this.nbRows + row;

      if (col < 0 || row < 0 || col >= this.nbCols || row >= this.nbRows) {
        return;
      }
      if (stack[index]) {
        return;
      }

      if (!predicate(this.getTileAt(row, col))) {
        return;
      }

      stack[index] = { row, col };

      fn(row - 1, col);
      fn(row, col - 1);
      fn(row + 1, col);
      fn(row, col + 1);
    };

    fn(originRow, originCol);

    return stack;
  }

  public getTileIndex(row: number, col: number): number {
    return row * this.nbCols + col;
  }

  public getRowAtCoord (y: number): number {
    return Math.trunc(y / this.tileSize);
  }

  public getColAtCoord (x: number): number {
    return Math.trunc(x / this.tileSize);
  }

  public getTileAtCoords(x: number, y: number): ITile | undefined {
    const r = this.getRowAtCoord(y);
    const c = this.getColAtCoord(x);

    return this.getTileAt(r, c);
  }

  public getTileAt(row: number, col: number): ITile | undefined {
    return this.tiles[row] ? this.tiles[row][col] : undefined;
  }

  public getTileIndexFromCoord(x: number, y: number): number {
    const r = this.getRowAtCoord(y);
    const c = this.getColAtCoord(x);

    return this.getTileIndex(r, c);
  }

  public getTileTypeIdAtCoords(layer: TileLayer, x: number, y: number): number {
    const r = this.getRowAtCoord(y);
    const c = this.getColAtCoord(x);

    return this.getTileTypeAt(layer, r, c);
  }

  public getTileTypeIdAtIndex(layer: TileLayer, i: number): number {
    const r = Math.trunc(i / this.nbCols);
    const c = Math.trunc(i % this.nbCols);

    return this.getTileTypeAt(layer, r, c);
  }

  public getTileTypeAt(layer: TileLayer, r: number, c: number): number {
    const tile = this.getTileAt(r, c);
    return tile.getTileTypeId(layer);
  }

  public hasCollisionAt(r: number, c: number): boolean {
    return this.getTileTypeAt(TileLayer.L0, r, c) === 1;
  }

  public hasCollisionAtCoords(x: number, y: number): boolean {
    return this.getTileTypeIdAtCoords(TileLayer.L0, x, y) === 1;
  }

  public getTileTypeById(id: number): ITileTypeData {
    return this.tileTypes[id];
  }

  public getBoundaries(): Box2 {
    return this.boundaries;
  }

  public getTileSize(): number {
    return this.tileSize;
  }

  public getNbCols(): number {
    return this.nbCols;
  }

  public getNbRows(): number {
    return this.nbRows;
  }
}

export default TileMap;
