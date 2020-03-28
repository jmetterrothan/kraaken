import { create2DArray } from "./../shared/utility/Utility";
import { ITileTypes } from "./../shared/models/tilemap.model";
import { mat3, vec2 } from "gl-matrix";

import Box2 from "@shared/math/Box2";
import Sprite from "@src/animation/Sprite";
import Vector2 from "@src/shared/math/Vector2";
import World from "@src/world/World";

import {
  ITile,
  ITileMapData,
  ITileTypeData
} from "@shared/models/tilemap.model";
import { configSvc } from "@src/shared/services/config.service";

class TileMap {
  private startCol: number;
  private startRow: number;
  private endCol: number;
  private endRow: number;

  private tileCountX: number;
  private tileCountY: number;

  private readonly nbCols: number;
  private readonly nbRows: number;

  private readonly tileSize: number;

  private readonly sizeX: number;
  private readonly sizeY: number;

  private boundaries: Box2;

  private tiles: {
    layer1: ITile[][];
    layer2: ITile[][];
  };

  private atlas: Sprite;

  constructor(data: ITileMapData) {
    this.nbCols = data.cols;
    this.nbRows = data.rows;
    this.tileSize = data.tileSize;

    this.sizeX = this.nbCols * this.tileSize;
    this.sizeY = this.nbRows * this.tileSize;

    this.boundaries = new Box2(
      this.sizeX / 2,
      this.sizeY / 2,
      this.sizeX,
      this.sizeY
    );

    this.tiles = {
      layer1: create2DArray(this.nbRows, this.nbCols),
      layer2: create2DArray(this.nbRows, this.nbCols)
    };

    this.buildLayer(1, data.layers.layer1, data.tileTypes);
    this.buildLayer(2, data.layers.layer2, data.tileTypes);
  }

  public buildLayer(layerId: number, tiles: number[], tileTypes: ITileTypes) {
    for (let r = 0; r < this.nbRows; r++) {
      for (let c = 0; c < this.nbCols; c++) {
        // convert 1d array of tiles to a 2d array
        const id = tiles[this.getIndex(r, c)];

        if (id !== 0) {
          this.createTile(tileTypes[id], r, c, layerId);
        }
      }
    }
  }

  public createTile(
    type: ITileTypeData,
    row: number,
    col: number,
    layer: number = 1
  ) {
    this.tiles[`layer${layer}`][row][col] = {
      type,
      model: mat3.fromTranslation(
        mat3.create(),
        vec2.fromValues(col * this.tileSize, row * this.tileSize)
      ),
      position: new Vector2(col * this.tileSize, row * this.tileSize),
      parameters: {
        direction: new Vector2(1, 1),
        wireframe: false,
        grayscale: false,
        flickering: false,
        alpha: 1
      }
    };
  }

  public init() {
    this.atlas = Sprite.get("tileset");
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

    this.tileCountX = this.endCol - this.startCol;
    this.tileCountY = this.endRow - this.startRow;
  }

  public render(viewProjectionMatrix: mat3, alpha: number) {
    this.atlas.use();

    for (let r = this.startRow; r <= this.endRow; r++) {
      for (let c = this.startCol; c <= this.endCol; c++) {
        if (
          this.tiles.layer1[r][c] &&
          this.tiles.layer1[r][c].type.key !== "void"
        ) {
          this.atlas.render(
            viewProjectionMatrix,
            this.tiles.layer1[r][c].model,
            this.tiles.layer1[r][c].type.row,
            this.tiles.layer1[r][c].type.col,
            this.tiles.layer1[r][c].parameters
          );
        }
      }
    }
  }

  public getTileAt(x: number, y: number, layer: number = 1): ITile | undefined {
    const [r, c] = this.getTileIndexesFromCoord(x, y);
    return (
      (this.tiles[`layer${layer}`][r] && this.tiles[`layer${layer}`][r][c]) ||
      undefined
    );
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
