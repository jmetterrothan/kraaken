import { mat3 } from "gl-matrix";

import Box2 from "@shared/math/Box2";
import Sprite from "@src/animation/Sprite";
import World from "@src/world/World";
import Tile from "./Tile";

import { create2DArray } from "./../shared/utility/Utility";
import { ITileTypes } from "./../shared/models/tilemap.model";
import { ITileMapData, ITileMapLayers } from "@shared/models/tilemap.model";

import { configSvc } from "@src/shared/services/config.service";

class TileMap {
  private startCol: number;
  private startRow: number;
  private endCol: number;
  private endRow: number;

  private readonly nbCols: number;
  private readonly nbRows: number;

  private readonly tileSize: number;
  private readonly tileSet: string;

  private readonly sizeX: number;
  private readonly sizeY: number;

  private boundaries: Box2;

  private tiles: Tile[][];

  private atlas: Sprite;

  constructor(data: ITileMapData) {
    this.nbCols = data.cols;
    this.nbRows = data.rows;
    this.tileSize = data.tileSize;
    this.tileSet = data.tileSet;

    this.sizeX = this.nbCols * this.tileSize;
    this.sizeY = this.nbRows * this.tileSize;

    this.boundaries = new Box2(
      this.sizeX / 2,
      this.sizeY / 2,
      this.sizeX,
      this.sizeY
    );

    this.tiles = create2DArray(this.nbRows, this.nbCols);

    this.buildTiles(data.layers, data.tileTypes);
  }

  public buildTiles(layers: ITileMapLayers, tileTypes: ITileTypes) {
    for (let r = 0; r < this.nbRows; r++) {
      for (let c = 0; c < this.nbCols; c++) {
        // convert 1d array of tiles to a 2d array
        const i = this.getIndex(r, c);

        const hasCollision = layers.layer1[i] === 1;

        const tile = new Tile(r, c, this.tileSize, hasCollision, {
          wireframe: false,
        });

        const type1 = layers.layer2[i];
        if (type1 !== 0) {
          tile.slot1 = tileTypes[type1];
        }

        const type2 = layers.layer3[i];
        if (type2 !== 0) {
          tile.slot2 = tileTypes[type2];
        }

        this.tiles[r][c] = tile;
      }
    }
  }

  public init() {
    this.atlas = Sprite.get(this.tileSet);
  }

  public getIndex(row: number, col: number): number {
    return row * this.nbCols + col;
  }

  public update(world: World, delta: number) {
    const center = world.getCamera().getPosition();

    this.startCol = Math.floor(
      (center.x - configSvc.innerSize.w / 2) / this.tileSize
    );
    this.startRow = Math.floor(
      (center.y - configSvc.innerSize.h / 2) / this.tileSize
    );
    this.endCol = Math.ceil(
      (center.x + configSvc.innerSize.w / 2) / this.tileSize
    );
    this.endRow = Math.ceil(
      (center.y + configSvc.innerSize.h / 2) / this.tileSize
    );

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

  public render(viewProjectionMatrix: mat3, alpha: number) {
    this.atlas.use();

    for (let r = this.startRow; r <= this.endRow; r++) {
      for (let c = this.startCol; c <= this.endCol; c++) {
        if (this.tiles[r][c] && this.tiles[r][c].slot1) {
          this.atlas.render(
            viewProjectionMatrix,
            this.tiles[r][c].model,
            this.tiles[r][c].slot1.row,
            this.tiles[r][c].slot1.col,
            this.tiles[r][c].renderOptions
          );
        }

        if (this.tiles[r][c] && this.tiles[r][c].slot2) {
          this.atlas.render(
            viewProjectionMatrix,
            this.tiles[r][c].model,
            this.tiles[r][c].slot2.row,
            this.tiles[r][c].slot2.col,
            this.tiles[r][c].renderOptions
          );
        }
      }
    }
  }

  public getTileAt(x: number, y: number, layer: number = 1): Tile | undefined {
    const [r, c] = this.getTileIndexesFromCoord(x, y);
    return this.tiles[r] ? this.tiles[r][c] : undefined;
  }

  public getTileIndexesFromCoord(x: number, y: number): [number, number] {
    const r = Math.trunc(y / this.tileSize);
    const c = Math.trunc(x / this.tileSize);

    return [r, c];
  }

  public getBoundaries(): Box2 {
    return this.boundaries;
  }
  public getTileSize(): number {
    return this.tileSize;
  }
}

export default TileMap;
