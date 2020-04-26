import { mat3 } from "gl-matrix";

import Box2 from "@shared/math/Box2";
import Sprite from "@src/animation/Sprite";
import World from "@src/world/World";
import Tile from "./Tile";

import { ITileMap, ITileTypes, ITileMapLayers, ITileTypeData } from "@src/shared/models/tilemap.model";

import { create2DArray } from "@src/shared/utility/Utility";

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
  private tileTypes: ITileTypes;

  private atlas: Sprite;

  constructor(data: ITileMap) {
    this.nbCols = data.cols;
    this.nbRows = data.rows;
    this.tileSize = data.tileSize;
    this.tileSet = data.tileSet;

    this.sizeX = this.nbCols * this.tileSize;
    this.sizeY = this.nbRows * this.tileSize;

    this.boundaries = Box2.createFromCenterPoint(this.sizeX / 2, this.sizeY / 2, this.sizeX, this.sizeY);

    this.tiles = create2DArray(this.nbRows, this.nbCols);
    this.tileTypes = data.tileTypes;

    this.buildTiles(data.layers);
  }

  public findTypeByKey(key: string): ITileTypeData | undefined {
    return Object.values(this.tileTypes).find((tileType) => tileType.key === key);
  }

  public buildTiles(layers: ITileMapLayers) {
    for (let r = 0; r < this.nbRows; r++) {
      for (let c = 0; c < this.nbCols; c++) {
        // convert 1d array of tiles to a 2d array
        const i = this.getIndex(r, c);

        const hasCollision = layers.layer1[i] === 1;

        const tile = new Tile(r, c, this.tileSize, hasCollision, {
          wireframe: false,
        });

        // TODO: read data
        const rockSingleType = this.findTypeByKey("rock_single");

        const type1 = layers.layer2[i];
        if (type1 !== 0) {
          tile.slot1 = rockSingleType;
        } else {
          tile.slot1 = undefined;
        }

        const type2 = layers.layer3[i];
        if (type2 !== 0) {
          tile.slot2 = rockSingleType;
        } else {
          tile.slot2 = undefined;
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

  public render(viewProjectionMatrix: mat3, alpha: number) {
    this.atlas.use();

    for (let r = this.startRow; r <= this.endRow; r++) {
      for (let c = this.startCol; c <= this.endCol; c++) {
        /*
        if (this.selectedLayerId === 0) {
          if (this.tiles[r][c] && this.tiles[r][c].collision) {
            this.tiles[r][c].renderOptions.fill = true;
            this.atlas.render(viewProjectionMatrix, this.tiles[r][c].model, this.tiles[r][c].row, this.tiles[r][c].col, this.tiles[r][c].renderOptions);
            this.tiles[r][c].renderOptions.fill = false;
          }
        } else {
          */
        if (this.tiles[r][c] && this.tiles[r][c].slot1) {
          this.atlas.render(viewProjectionMatrix, this.tiles[r][c].model, this.tiles[r][c].slot1.row, this.tiles[r][c].slot1.col, this.tiles[r][c].renderOptions);
        }

        if (this.tiles[r][c] && this.tiles[r][c].slot2) {
          this.atlas.render(viewProjectionMatrix, this.tiles[r][c].model, this.tiles[r][c].slot2.row, this.tiles[r][c].slot2.col, this.tiles[r][c].renderOptions);
        }
        /* }*/
      }
    }
  }

  public floodFill(originRow: number, originCol: number, predicate: (tile?: Tile) => boolean) {
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

  public getTileAtCoords(x: number, y: number): Tile | undefined {
    const [r, c] = this.getTileIndexesFromCoord(x, y);
    return this.getTileAt(r, c);
  }

  public getTileAt(row: number, col: number): Tile | undefined {
    return this.tiles[row] ? this.tiles[row][col] : undefined;
  }

  public getTileIndexesFromCoord(x: number, y: number): [number, number] {
    const r = Math.trunc(y / this.tileSize);
    const c = Math.trunc(x / this.tileSize);

    return [r, c];
  }

  public getTileType(id: string): ITileTypeData {
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
