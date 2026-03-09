import { mat3, vec2 } from "gl-matrix";

import { Camera } from "@src/ECS/components";

import SpriteManager from "@src/animation/SpriteManager";
import World from "@src/world/World";

import { ILayer, ILevelBlueprint } from "@src/shared/models/world.model";
import { TintEffect } from "@src/shared/models/animation.model";
import { ITile } from "@src/shared/models/tilemap.model";

import Box2 from "@src/shared/math/Box2";
import Color from "@src/shared/helper/Color";
import Vector2 from "@src/shared/math/Vector2";

import { create2DArray } from "@src/shared/utility/Utility";
import PriorityQueue from "@src/shared/utility/PriorityQueue";

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
};

class TileMap {
  private startCol: number;
  private startRow: number;
  private endCol: number;
  private endRow: number;

  public tiles: ITile[][];

  public layers: ILayer[];
  private collisionLayerId: number;
  private layerIndexMapping: Map<number, number>;

  private boundaries: Box2;

  private readonly nbCols: number;
  private readonly nbRows: number;

  private readonly tileSize: number;

  private readonly sizeX: number;
  private readonly sizeY: number;

  private debugLayer: Map<number, number>;

  constructor(blueprint: ILevelBlueprint) {
    this.nbCols = blueprint.tileMapCols;
    this.nbRows = blueprint.tileMapRows;
    this.tileSize = blueprint.tileSize;

    this.startCol = 0;
    this.startRow = 0;
    this.endCol = 0;
    this.endRow = 0;

    this.sizeX = this.nbCols * this.tileSize;
    this.sizeY = this.nbRows * this.tileSize;

    this.boundaries = new Box2(this.sizeX / 2, this.sizeY / 2, this.sizeX, this.sizeY);

    this.tiles = create2DArray<ITile>(this.nbRows, this.nbCols);

    this.layers = blueprint.layers.sort((a, b) => a.zIndex - b.zIndex);

    this.layerIndexMapping = this.layers.reduce((acc, layer, index) => {
      acc.set(layer.id, index);
      return acc;
    }, new Map<number, number>());

    this.collisionLayerId = this.layers.find((layer) => layer.type === "collision")?.id ?? 0;

    this.debugLayer = new Map<number, number>();

    const direction = new Vector2(1, 1);
    const outlineColor = new Color(1.0, 1.0, 1.0, 1.0).toVec4();
    const tintColor = new Color(1.0, 1.0, 1.0, 1.0).toVec4();

    for (let r = 0; r < this.nbRows; r++) {
      for (let c = 0; c < this.nbCols; c++) {
        const getTileTypeId = (layerId: number) => {
          const layerIndex = this.getLayerIndex(layerId);

          if (layerIndex !== -1) {
            const index = r * this.nbCols + c;
            return this.layers[layerIndex].data[index] ?? 0;
          }
          return 0;
        };

        const setTileTypeId = (layerId: number, id: number) => {
          const layerIndex = this.getLayerIndex(layerId);

          if (layerIndex !== -1) {
            const index = r * this.nbCols + c;
            this.layers[layerIndex].data[index] = id;
          }
        };

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
          direction,
          renderOptions: {
            grayscale: false,
            flickering: false,
            flickerSpeed: 250,
            outlineColor,
            tintColor,
            tintEffect: TintEffect.NONE,
            reflect: false,
            alpha: 1,
          },
          f: 0,
          g: 0,
          h: 0,
          cost: 1,
          visited: false,
          closed: false,
          parent: null,
          getTileTypeId,
          setTileTypeId,
          hasCollision: () => {
            return getTileTypeId(this.collisionLayerId) === 1;
          },
          setCollision: (b) => {
            setTileTypeId(this.collisionLayerId, b ? 1 : 0);
          },
        };

        this.tiles[r][c] = tile;
      }
    }
  }

  public init(): void {}

  public update(world: World, _delta: number): void {
    const cam = world.camera.getComponent(Camera);

    const vb = cam.viewBox; // world-space bounds of the viewport

    this.startCol = Math.floor(vb.x1 / this.tileSize);
    this.startRow = Math.floor(vb.y1 / this.tileSize);
    this.endCol = Math.ceil(vb.x2 / this.tileSize);
    this.endRow = Math.ceil(vb.y2 / this.tileSize);

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

  private getLayerAtlasById(layerId: number) {
    const layerIndex = this.getLayerIndex(layerId);

    return this.getLayerAtlasByIndex(layerIndex);
  }

  private getLayerAtlasByIndex(layerIndex: number) {
    const layer = this.layers[layerIndex];

    if (!layer || layer.tileSet === null) {
      return null;
    }

    return SpriteManager.get(layer.tileSet);
  }

  public renderLayers(projectionMatrix: mat3, viewMatrix: mat3, _alpha: number): void {
    for (let layer of this.layers) {
      if (!layer.visible) {
        continue;
      }

      const atlas = this.getLayerAtlasById(layer.id);

      if (!atlas) {
        continue;
      }

      atlas.use();

      for (let r = this.startRow; r <= this.endRow; r++) {
        for (let c = this.startCol; c <= this.endCol; c++) {
          const tile = this.tiles[r][c];
          const tileTypeId = tile.getTileTypeId(layer.id);

          if (tileTypeId > 0) {
            atlas.render(projectionMatrix, viewMatrix, tile.transform, tileTypeId, tile.direction, tile.renderOptions);
          }
        }
      }
    }
  }

  public renderCollisionLayer(projectionMatrix: mat3, viewMatrix: mat3, _alpha: number): void {
    const atlas = this.getLayerAtlasById(this.collisionLayerId);

    if (!atlas) {
      return;
    }

    atlas.use();

    for (let r = this.startRow; r <= this.endRow; r++) {
      for (let c = this.startCol; c <= this.endCol; c++) {
        const tile = this.tiles[r][c];

        if (tile.hasCollision()) {
          atlas.render(projectionMatrix, viewMatrix, tile.transform, 0, tile.direction, { ...tile.renderOptions, alpha: 0.4 });
        }
      }
    }
  }

  /*
  public renderDebugLayer(projectionMatrix: mat3, viewMatrix: mat3, _alpha: number): void {
    const atlas = this.getLayerAtlas(TileLayer.L2);

    if (!atlas) {
      return;
    }

    atlas.use();

    for (let r = this.startRow; r <= this.endRow; r++) {
      for (let c = this.startCol; c <= this.endCol; c++) {
        const tile = this.tiles[r][c];

        if (this.debugLayer.has(tile.index)) {
          const n = this.debugLayer.get(tile.index);
          if (typeof n === "number" && n > 0) {
            atlas.render(projectionMatrix, viewMatrix, tile.transform, n, tile.direction, { ...tile.renderOptions, alpha: 0.4 });
          }
        }
      }
    }
  }
    */

  public floodFill(originRow: number, originCol: number, predicate: (tile?: ITile) => boolean): any[] {
    const stack: Array<{ row: number; col: number }> = [];

    const fn = (row: number, col: number) => {
      const index = row * this.nbCols + col;

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

  public getNeighbors(currentTile: ITile, orders?: Array<[number, number]>): ITile[] {
    if (typeof orders === "undefined") {
      const p = (currentTile.col + currentTile.row) % 2;

      if (p === 0) {
        // South, North, West, East
        orders = [
          /*[1, 1], [-1, -1], [1, -1], [-1, 1],*/ [1, 0],
          [-1, 0],
          [0, -1],
          [0, 1],
        ];
      } else {
        // East, West, North, South
        orders = [
          /*[1, 1], [-1, -1], [1, -1], [-1, 1],*/ [0, 1],
          [0, -1],
          [-1, 0],
          [1, 0],
        ];
      }
    }
    //(-1, -1), (-1, +1), (+1, -1), (+1, +1), (+1, 0), (0, -1), (-1, 0), (0, +1)
    return orders.reduce<ITile[]>((acc, [r, c]) => {
      const tile = this.getTileAt(currentTile.row + r, currentTile.col + c);
      if (tile) {
        acc.push(tile);
      }
      return acc;
    }, []);
  }

  public aStar(startTile: ITile, goalTile: ITile, heuristic: (a: ITile, b: ITile) => number = heuristics.manhattan, debug = true): ITile[] {
    if (!startTile || startTile.hasCollision()) {
      throw new Error("Invalid start tile");
    }

    if (!goalTile || goalTile.hasCollision()) {
      throw new Error("Invalid goal tile");
    }

    this.debugLayer = new Map<number, number>();

    for (let r = 0; r < this.nbRows; r++) {
      for (let c = 0; c < this.nbCols; c++) {
        const tile = this.getTileAt(r, c);
        if (tile) {
          tile.f = 0;
          tile.g = 0;
          tile.h = 0;
          tile.cost = 1;
          tile.visited = false;
          tile.closed = false;
          tile.parent = null;
        }
      }
    }

    if (debug) {
      this.debugLayer.set(startTile.index, 624);
      this.debugLayer.set(goalTile.index, 623);
    }

    const openHeap = new PriorityQueue<ITile>((a, b) => a.f < b.f);

    openHeap.push(startTile);

    while (openHeap.size() > 0) {
      const currentNode = openHeap.pop();

      if (currentNode.index === goalTile.index) {
        const ret = [];

        let temp = currentNode;
        while (temp.parent) {
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
          if (neighbor.hasCollision() && neighbor.index !== goalTile.index && neighbor.index !== startTile.index && debug) {
            this.debugLayer.set(neighbor.index, 582);
          }
          continue;
        }

        const gScore = currentNode.g + neighbor.cost;
        const visited = neighbor.visited;

        if (!visited || gScore < neighbor.g) {
          // tie breaker
          let heuristicValue = heuristic(neighbor, goalTile);

          const dx1 = currentNode.col - goalTile.col;
          const dy1 = currentNode.row - goalTile.row;
          const dx2 = startTile.col - goalTile.col;
          const dy2 = startTile.row - goalTile.row;
          const cross = Math.abs(dx1 * dy2 - dx2 * dy1);

          heuristicValue += cross * 0.001;

          // avoid walls
          if (
            this.getNeighbors(neighbor, [
              [1, 1],
              [-1, -1],
              [1, -1],
              [-1, 1],
              [0, 1],
              [1, 0],
              [-1, 0],
              [0, -1],
            ]).some((tile) => tile.hasCollision())
          ) {
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

    console.error("failed");
    return [];
  }

  public getTileIndex(row: number, col: number): number {
    return row * this.nbCols + col;
  }

  public getRowAtCoord(y: number): number {
    return Math.trunc(y / this.tileSize);
  }

  public getColAtCoord(x: number): number {
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

  public getTileTypeIdAtCoords(layerId: number, x: number, y: number): number | null {
    const r = this.getRowAtCoord(y);
    const c = this.getColAtCoord(x);

    return this.getTileTypeAt(layerId, r, c);
  }

  public getTileTypeIdAtIndex(layerId: number, i: number): number {
    const r = Math.trunc(i / this.nbCols);
    const c = Math.trunc(i % this.nbCols);

    return this.getTileTypeAt(layerId, r, c) ?? 0;
  }

  public getTileTypeAt(layerId: number, r: number, c: number): number | null {
    const tile = this.getTileAt(r, c);
    if (!tile) {
      console.warn(`Out of bound tile @ r:${r}, c:${c} on layer index ${layerId}`);
    }
    return tile?.getTileTypeId(layerId) ?? null;
  }

  public hasCollisionAt(r: number, c: number): boolean {
    return this.getTileAt(r, c)?.hasCollision() ?? true;
  }

  public hasCollisionAtCoords(x: number, y: number): boolean {
    return this.getTileAtCoords(x, y)?.hasCollision() ?? true;
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

  public getLayerIndex(layerId: number) {
    return this.layerIndexMapping.get(layerId) ?? -1;
  }
}

export default TileMap;
