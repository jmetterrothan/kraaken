import { mat3, vec2 } from 'gl-matrix';

import Box2 from '@shared/math/Box2';
import Sprite from '@src/animation/Sprite';
import Vector2 from '@src/shared/math/Vector2';
import World from '@src/world/World';

import { ITile, ITileMapData } from '@shared/models/tilemap.model';
import { configSvc } from '@src/shared/services/config.service';

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

  private tiles: ITile[][];

  private atlas: Sprite;

  constructor(data: ITileMapData) {
    this.nbCols = data.cols;
    this.nbRows = data.rows;
    this.tileSize = data.tileSize;

    this.sizeX = this.nbCols * this.tileSize;
    this.sizeY = this.nbRows * this.tileSize;

    this.boundaries = new Box2(this.sizeX / 2, this.sizeY / 2, this.sizeX, this.sizeY);

    const tilemapRenderParameters = {
      direction: new Vector2(1, 1),
      wireframe: false,
      grayscale: false,
      flickering: false,
      alpha: 1,
    };

    // convert 1d array of tiles to a 2d array
    this.tiles = new Array(this.nbRows);
    for (let r = 0; r < this.nbRows; r++) {
      this.tiles[r] = new Array(this.nbCols);

      for (let c = 0; c < this.nbCols; c++) {
        const type = data.tileTypes[data.tiles[this.getIndex(r, c)]];
        this.tiles[r][c] = {
          type: {
            collision: type && type.collision || false,
            row: type && type.row || 0,
            col: type && type.col || 0,
          },
          model: mat3.fromTranslation(mat3.create(), vec2.fromValues(c * this.tileSize, r * this.tileSize)),
          position: new Vector2(c * this.tileSize, r * this.tileSize),
          parameters: tilemapRenderParameters,
        };
      }
    }
  }

  public init() {
    this.atlas = Sprite.get('tileset');
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

    this.tileCountX = this.endCol - this.startCol;
    this.tileCountY = this.endRow - this.startRow;
  }

  public render(viewProjectionMatrix: mat3, alpha: number) {
    this.atlas.use();

    for (let r = this.startRow; r <= this.endRow; r++) {
      for (let c = this.startCol; c <= this.endCol; c++) {
        if (this.tiles[r][c].type.collision) {
          this.atlas.render(
            viewProjectionMatrix,
            this.tiles[r][c].model,
            this.tiles[r][c].type.row,
            this.tiles[r][c].type.col,
            this.tiles[r][c].parameters,
          );
        }
      }
    }
  }

  public getTileAt(x: number, y: number): ITile | undefined {
    const r = Math.trunc(y / this.tileSize);
    const c = Math.trunc(x / this.tileSize);
    return this.tiles[r] && this.tiles[r][c] || undefined;
  }

  public getBoundaries(): Box2 { return this.boundaries; }
  public getTileSize(): number { return this.tileSize; }
}

export default TileMap;
