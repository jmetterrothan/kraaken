import { mat3, vec2 } from "gl-matrix";

import { Position } from "@src/ECS/components";

import SpriteAtlas from "@src/animation/SpriteAtlas";
import SpriteManager from "@src/animation/SpriteManager";
import World from "@src/world/World";

import { IWorldBlueprint } from '@shared/models/world.model';
import { TintEffect } from "@src/shared/models/animation.model";
import { TileLayer, ITile } from "@shared/models/tilemap.model";

import Box2 from "@shared/math/Box2";
import Color from "@shared/helper/Color";
import Vector2  from '@shared/math/Vector2';

import { create2DArray } from "@shared/utility/Utility";
import  PriorityQueue  from '@src/shared/utility/PriorityQueue';

import { configSvc } from "@shared/services/ConfigService";

import config from '@src/config';

export const heuristics = {
  manhattan: (a: ITile, b: ITile): number => {
    const d1 = Math.abs(a.col - b.col);
    const d2 = Math.abs(a.row - b.row);
  
    return d1 + d2;
  },
  euclidian: (a: ITile, b: ITile): number => {
    const d1 = Math.abs(a.col - b.col);
    const d2 = Math.abs(a.row - b.row);

    return Math.sqrt(d1 * d1 + d2 * d2);
  },
}

class TileMap {
  private startCol: number;
  private startRow: number;
  private endCol: number;
  private endRow: number;

  public tiles: ITile[][];
  public atlas: SpriteAtlas;

  private boundaries: Box2;

  private readonly nbCols: number;
  private readonly nbRows: number;

  private readonly tileSize: number;
  private readonly tileSet: string;

  private readonly sizeX: number;
  private readonly sizeY: number;

  private debugLayer: Map<number, number>;

  constructor(blueprint: IWorldBlueprint) {
    this.nbCols = blueprint.level.tileMapCols;
    this.nbRows = blueprint.level.tileMapRows;
    this.tileSize = blueprint.level.tileSize;
    this.tileSet = blueprint.level.tileSet;

    this.sizeX = this.nbCols * this.tileSize;
    this.sizeY = this.nbRows * this.tileSize;

    this.boundaries = new Box2(this.sizeX / 2, this.sizeY / 2, this.sizeX, this.sizeY);

    this.atlas = SpriteManager.get(this.tileSet);

    this.tiles = create2DArray<ITile>(this.nbRows, this.nbCols);

    this.debugLayer = new Map<number, number>();
   
    for (let r = 0; r < this.nbRows; r++) {
      for (let c = 0; c < this.nbCols; c++) {
        const tile: ITile = {
          row: r,
          col: c,
          x1: c * this.tileSize,
          x2: c * this.tileSize + this.tileSize,
          y1: r * this.tileSize,
          y2: r * this.tileSize + this.tileSize,
          index: r * this.nbCols + c,
          transform: mat3.fromTranslation(mat3.create(), vec2.fromValues(c * this.tileSize, r * this.tileSize)),
          position: new Vector2(c * this.tileSize, r * this.tileSize),
          size: this.tileSize,
          direction: new Vector2(1, 1),
          renderOptions: {
            grayscale: false,
            flickering: false,
            flickerSpeed: 250,
            outlineColor: new Color(1.0, 1.0, 1.0, 1.0).toVec4(),
            tintColor: new Color(1.0, 1.0, 1.0, 1.0).toVec4(),
            tintEffect: TintEffect.NONE,
            reflect: false,
          },
          f: 0,
          g: 0,
          h: 0,
          cost: 1,
          visited: false,
          closed: false,
          parent: null,
          hasCollision: () => {
            return blueprint.level.layers[TileLayer.L0][r * this.nbCols + c] === 1;
          },
          setCollision: (b) => {
            blueprint.level.layers[TileLayer.L1][r * this.nbCols + c] = b ? 1 : 0;
          },
          getTileTypeId: (layer) => {
            const index = r * this.nbCols + c;

            return blueprint.level.layers[layer][index];
          },
          setTileTypeId: (layer, id) => {
            const index = r * this.nbCols + c;
            
            if (layer === TileLayer.L1) {
              blueprint.level.layers[TileLayer.L0][index] = id > 0 ? 1 : 0;
            }
            blueprint.level.layers[layer][index] = id;
          },
        };

        this.tiles[r][c] = tile;
      }
    }
  }

  public init(): void {
    
  }

  public update(world: World, delta: number): void {
    const center = world.camera.getComponent(Position);

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

    // fix for texture bleeding by rounding the x, y components
    viewMatrix[6] = Math.round(viewMatrix[6]);
    viewMatrix[7] = Math.round(viewMatrix[7]);
  
    for (let r = this.startRow; r <= this.endRow; r++) {
      for (let c = this.startCol; c <= this.endCol; c++) {
        const tile = this.tiles[r][c];

        const layer1Index = tile.getTileTypeId(TileLayer.L1);
        const layer2Index = tile.getTileTypeId(TileLayer.L2);

        tile.transform[6] = Math.round(tile.transform[6]);
        tile.transform[7] = Math.round(tile.transform[7]);

        if (config.DEBUG && tile.hasCollision() && layer1Index === 0) {
          this.atlas.render(projectionMatrix, viewMatrix, tile.transform, 0, tile.direction, tile.renderOptions);
        }

        if (layer1Index > 0) {
           this.atlas.render(projectionMatrix, viewMatrix, tile.transform, layer1Index, tile.direction, tile.renderOptions);
        }

        if (layer2Index > 0) {
          this.atlas.render(projectionMatrix, viewMatrix, tile.transform, layer2Index, tile.direction, tile.renderOptions);
        }

        if (config.DEBUG && this.debugLayer.has(tile.index) && this.debugLayer.get(tile.index) > 0) {
          this.atlas.render(projectionMatrix, viewMatrix, tile.transform, this.debugLayer.get(tile.index), tile.direction, tile.renderOptions);
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

  public getNeighbors (currentTile: ITile, orders?: Array<[number, number]>): ITile[] {
    if (typeof orders === 'undefined') {
      const p = (currentTile.col + currentTile.row) % 2;

      if (p === 0) {
        // South, North, West, East 
        orders = [/*[1, 1], [-1, -1], [1, -1], [-1, 1],*/ [1, 0], [-1, 0], [0, -1], [0, 1]];
      } else {
        // East, West, North, South
        orders = [/*[1, 1], [-1, -1], [1, -1], [-1, 1],*/ [0, 1], [0, -1], [-1, 0], [1, 0]];
      }
    }
    //(-1, -1), (-1, +1), (+1, -1), (+1, +1), (+1, 0), (0, -1), (-1, 0), (0, +1)
    return orders.reduce((acc, [r, c]) => {
      const tile = this.getTileAt(currentTile.row + r, currentTile.col + c);
      if (tile) {
        acc.push(tile);
      }
      return acc;
    }, []);
  }

  public aStar(startTile: ITile, goalTile: ITile, heuristic: (a: ITile, b: ITile) => number = heuristics.manhattan, debug = true): ITile[] {
    if (!startTile || startTile.hasCollision()) {
      throw new Error('Invalid start tile');
    }

    if (!goalTile || goalTile.hasCollision()) {
      throw new Error('Invalid goal tile');
    }

    this.debugLayer = new Map<number, number>();

    for (let r = 0; r < this.nbRows; r++) {
      for (let c = 0; c < this.nbCols; c++) {
        const tile = this.getTileAt(r, c);
        tile.f = 0;
        tile.g = 0;
        tile.h = 0;
        tile.cost = 1;
        tile.visited = false;
        tile.closed = false;
        tile.parent = null;
      }
    }

    if (debug) {
      this.debugLayer.set(startTile.index, 624); 
      this.debugLayer.set(goalTile.index, 623);
    }

    const openHeap = new PriorityQueue<ITile>((a, b) => a.f < b.f);

    openHeap.push(startTile);

    while(openHeap.size() > 0) {
      const currentNode = openHeap.pop();

      if (currentNode.index === goalTile.index) {
        const ret = [];
        
        let temp = currentNode;
        while(temp.parent) {
          if (temp.index !== goalTile.index && temp.index !== startTile.index && debug) {
            this.debugLayer.set(temp.index, 623);
          }
          ret.push(temp);
          temp = temp.parent;
        }

        return ret.reverse();
      }

      currentNode.closed = true;

      for (const neighbor of this.getNeighbors(currentNode)) {
        if (neighbor.closed || neighbor.hasCollision()) {
          if (neighbor.hasCollision() && neighbor.index !== goalTile.index && neighbor.index !== startTile.index  && debug) {
            this.debugLayer.set(neighbor.index, 582);
          }
          continue;
        }

        const gScore = currentNode.g + neighbor.cost;
        const visited = neighbor.visited;

        if (!visited || gScore < neighbor.g) {
          // tie breaker
          let heuristicValue = heuristic(neighbor, goalTile)

          const dx1 = currentNode.col - goalTile.col;
          const dy1 = currentNode.row - goalTile.row;
          const dx2 = startTile.col - goalTile.col;
          const dy2 = startTile.row - goalTile.row;
          const cross = Math.abs(dx1 * dy2 - dx2 * dy1);

          heuristicValue += cross * 0.001;

          // avoid walls
          if (this.getNeighbors(neighbor, [[1, 1], [-1, -1], [1, -1], [-1, 1], [0, 1], [1, 0], [-1, 0], [0, -1]]).findIndex((tile) => tile.hasCollision(), true) !== -1) {
            heuristicValue += 8;
          }

          neighbor.visited = true;
          neighbor.parent = currentNode;
          neighbor.h = neighbor.h || heuristicValue;
          neighbor.g = gScore;
          neighbor.f = neighbor.g + neighbor.h;

          if (!visited) {
            if (neighbor.index !== goalTile.index && neighbor.index !== startTile.index && debug) {
              this.debugLayer.set(neighbor.index, 583);
            }
            openHeap.push(neighbor);
          }
        }
      }
    }

    console.error('failed');
    return [];
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
