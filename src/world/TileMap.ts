import { mat3, vec2 } from 'gl-matrix';

import Box2 from '@shared/math/Box2';
import Sprite from '@src/animation/Sprite';
import Vector2 from '@src/shared/math/Vector2';

import { ITileMapData } from '@shared/models/tilemap.model';

class TileMap {
  private readonly nbCols: number;
  private readonly nbRows: number;
  private readonly tileSize: number;
  private readonly sizeX: number;
  private readonly sizeY: number;

  private boundaries: Box2;

  private tiles: any[][];

  private atlas: Sprite;

  constructor(data: ITileMapData) {
    this.nbCols = data.cols;
    this.nbRows = data.rows;
    this.tileSize = data.tileSize;

    this.sizeX = this.nbCols * this.tileSize;
    this.sizeY = this.nbRows * this.tileSize;

    this.boundaries = new Box2(this.sizeX / 2, this.sizeY / 2, this.sizeX, this.sizeY);

    // convert 1d array of tiles to a 2d array
    this.tiles = new Array(this.nbRows);
    for (let r = 0; r < this.nbRows; r++) {
      this.tiles[r] = new Array(this.nbCols);

      for (let c = 0; c < this.nbCols; c++) {
        this.tiles[r][c] = {
          type: data.tileTypes[data.tiles[this.getIndex(r, c)]],
          model: mat3.fromTranslation(mat3.create(), vec2.fromValues(c * this.tileSize, r * this.tileSize)),
          orientation: new Vector2(1, 1),
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

  public update() {

  }

  public render(viewProjectionMatrix: mat3) {
    this.atlas.use();

    for (let r = 0; r < this.nbRows; r++) {
      for (let c = 0; c < this.nbCols; c++) {
        if (this.tiles[r][c].type) {
          this.atlas.render(
            viewProjectionMatrix,
            this.tiles[r][c].model,
            this.tiles[r][c].type.row,
            this.tiles[r][c].type.col,
            this.tiles[r][c].orientation,
            false,
          );
        }
      }
    }
  }

  public getBoundaries(): Box2 { return this.boundaries; }
}

export default TileMap;
