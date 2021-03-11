import { vec2 } from "gl-matrix";

import { Position } from "@src/ECS/components";

import EditorState from "@src/states/EditorState";

import * as GameEventTypes from "@shared/events/constants";
import dispatch, * as GameEvents from "@shared/events";

import eventStackSvc from "@shared/services/EventStackService";

import { driver } from "@shared/drivers/DriverFactory";

import { EditorTerrainMode } from "@shared/models/editor.model";
import { ITile, TileLayer } from "@shared/models/tilemap.model";

import editorStore from "../editorStore";

class TerrainMode {
  private editor: EditorState;

  public constructor(editor: EditorState) {
    this.editor = editor;
  }

  public mounted(): void {
    this.editor.registerEvent(GameEventTypes.PLACE_EVENT, (e: GameEvents.PlaceEvent) => {
      const { coords = [], layer, tileTypeId, onSuccess, onFailure, pushToStack } = e.detail || {};

      if (typeof tileTypeId === "undefined") {
        throw new Error("Undefined tile type index");
      }

      let oldTileTypeId: number;

      try {
        const tileMap = this.editor.world.tileMap;

        // compute layer transforms
        coords.forEach((coord) => {
          const tile = tileMap.getTileAtCoords(coord.x, coord.y);

          if (tile) {
            oldTileTypeId = tile.getTileTypeId(layer);

            if (layer === TileLayer.L0) {
              tile.setCollision(tileTypeId > 0);
            } else {
              tile.setTileTypeId(layer, tileTypeId);
            }
          }
        });

        // register event
        if (oldTileTypeId !== tileTypeId && pushToStack) {
          eventStackSvc.undoStack.push({
            undo: () => driver.place({ layerId: layer, tileTypeId: oldTileTypeId, coords }, false), //
            redo: () => driver.place({ layerId: layer, tileTypeId, coords }, false),
          });
        }

        if (typeof onSuccess === "function") {
          onSuccess();
        }
      } catch (e) {
        console.error(e);

        if (typeof onFailure === "function") {
          onFailure();
        }
      }
    });
  }

  public unmounted(): void {}

  public update(delta: number): void {
    const cursorPosition = this.editor.cursor.getComponent(Position);
    const gridCursorPosition = this.editor.gridCursor.getComponent(Position);

    cursorPosition.fromValues(this.editor.mouse.x, this.editor.mouse.y);

    const tile = this.editor.world.tileMap.getTileAtCoords(this.editor.mouse.x, this.editor.mouse.y);

    if (tile) {
      const x = tile.position.x + tile.size / 2;
      const y = tile.position.y + tile.size / 2 + 1;
      gridCursorPosition.fromValues(x, y);
    }
  }

  public render(alpha: number): void {}

  public handleKeyboardInput(key: string, active: boolean): void {}

  public handleMouseLeftBtnPressed(active: boolean, position: vec2): void {
    if (active) {
      const tileMap = this.editor.world.tileMap;
      const coords = this.editor.world.screenToCameraCoords(position);

      const { layerId, tileTypeId, terrainMode } = this.editor.state;

      if (terrainMode === EditorTerrainMode.PICK) {
        const tile = tileMap.getTileAtCoords(coords.x, coords.y);
        if (tile) {
          const tileTypeId = tile.getTileTypeId(layerId);
          editorStore.setSelectedTileTypeId(tileTypeId);
        }
      } else if (this.editor.state.terrainMode === EditorTerrainMode.PLACE) {
        driver.place({ layerId, tileTypeId, coords: [coords] }, true);
      } else if (this.editor.state.terrainMode === EditorTerrainMode.ERASE) {
        driver.place({ layerId, tileTypeId: 0, coords: [coords] }, true);
      } else if (this.editor.state.terrainMode === EditorTerrainMode.FILL) {
        const targetTile = tileMap.getTileAtCoords(coords.x, coords.y);
        const tileSize = tileMap.getTileSize();

        if (targetTile) {
          const targetId = targetTile.getTileTypeId(layerId);
          const listOfCoords = tileMap.floodFill(targetTile.row, targetTile.col, (tile: ITile) => tile && tile.getTileTypeId(layerId) === targetId).map(({ row, col }) => ({ x: col * tileSize, y: row * tileSize }));

          driver.place({ layerId, tileTypeId, coords: listOfCoords }, true);
        }
      }
    }
  }

  public handleMouseMiddleBtnPressed(active: boolean, position: vec2): void {}

  public handleMouseRightBtnPressed(active: boolean, position: vec2): void {}

  public handleMouseMove(position: vec2): void {}
}

export default TerrainMode;
