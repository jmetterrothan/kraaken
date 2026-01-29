import { vec2 } from "gl-matrix";

import { Position } from "@src/ECS/components";

import EditorState from "@src/states/EditorState";

import * as GameEventTypes from "@src/shared/events/constants";
import * as GameEvents from "@src/shared/events";

import eventStackSvc from "@src/shared/services/EventStackService";

import { driver } from "@src/shared/drivers/DriverFactory";

import { EditorTerrainMode } from "@src/shared/models/editor.model";
import { ITile, TileLayer } from "@src/shared/models/tilemap.model";

import editorStore from "../editorStore";

import MouseButton from "@src/enums/MouseButton";

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

      let oldTileTypeId: number = tileTypeId;

      try {
        const tileMap = this.editor.currentRoom.world.tileMap;

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

  public update(_delta: number): void {
    const cursorPosition = this.editor.currentRoom.cursor.getComponent(Position);
    const gridCursorPosition = this.editor.currentRoom.gridCursor.getComponent(Position);

    cursorPosition.fromValues(this.editor.mouse.x, this.editor.mouse.y);

    const tile = this.editor.currentRoom.world.tileMap.getTileAtCoords(this.editor.mouse.x, this.editor.mouse.y);

    if (tile) {
      const x = tile.position.x + tile.size / 2;
      const y = tile.position.y + tile.size / 2 + 1;
      gridCursorPosition.fromValues(x, y);
    }
  }

  public render(_alpha: number): void {}

  public handleKeyboardInput(_key: string, _active: boolean): void {}

  public handleMouseInput(button: MouseButton, active: boolean, position: vec2): void {
    if (active) {
      const coords = this.editor.currentRoom.world.screenToCameraCoords(position);

      switch (button) {
        case MouseButton.LEFT: {
          const tileMap = this.editor.currentRoom.world.tileMap;

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
              const listOfCoords = tileMap.floodFill(targetTile.row, targetTile.col, (tile: ITile | undefined) => typeof tile !== "undefined" && tile.getTileTypeId(layerId) === targetId).map(({ row, col }) => ({ x: col * tileSize, y: row * tileSize }));

              driver.place({ layerId, tileTypeId, coords: listOfCoords }, true);
            }
          }
        }
      }
    }
  }

  public handleMouseMove(_position: vec2): void {}
}

export default TerrainMode;
