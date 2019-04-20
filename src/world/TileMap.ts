import Box2 from '@shared/math/Box2';
import World from '@src/world/World';

class TileMap {
  private readonly nbCols: number;
  private readonly nbRows: number;
  private readonly tileSize: number;
  private readonly sizeX: number;
  private readonly sizeY: number;

  private boundaries: Box2;

  constructor(cols: number, rows: number, tileSize: number) {
    this.nbCols = cols;
    this.nbRows = rows;
    this.tileSize = tileSize;

    this.sizeX = this.nbCols * this.tileSize;
    this.sizeY = this.nbRows * this.tileSize;

    this.boundaries = new Box2(this.sizeX / 2, this.sizeY / 2, this.sizeX, this.sizeY);
  }

  public update(world: World, delta: number) {

  }

  public getBoundaries(): Box2 { return this.boundaries; }
}

export default TileMap;
