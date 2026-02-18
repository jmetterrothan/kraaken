import { vec2 } from "gl-matrix";

import EditorState from "@src/states/EditorState";

import * as GameEventTypes from "@src/shared/events/constants";
import * as GameEvents from "@src/shared/events";

import eventStackSvc from "@src/shared/services/EventStackService";

import { driver } from "@src/shared/drivers/DriverFactory";

import { EditorTerrainMode } from "@src/shared/models/editor.model";
import { ITile, TileLayer } from "@src/shared/models/tilemap.model";

import editorStore from "../editorStore";

import keyBindings, { matchKeyBinding } from "@src/keyBindings";
import mouseBindings, { matchMouseBinding } from "@src/mouseBindings";
import { debugSvc } from "@src/shared/services/Debug";
import { DebugFlag } from "@src/enums/DebugFlag";

class TerrainMode {
  private loaded: boolean;

  private editor: EditorState;

  private events: Array<() => void>;

  public constructor(editor: EditorState) {
    this.editor = editor;

    this.events = [];
  }

  public mounted(): void {
    if (this.loaded) {
      throw new Error("Terrain mode already mounted");
    }

    debugSvc.set(DebugFlag.GRID, true);
    debugSvc.set(DebugFlag.COLLISION, false);
    debugSvc.set(DebugFlag.ENTITIES, false);

    this.events.push(
      this.editor.registerEvent(GameEventTypes.PLACE_EVENT, (e: GameEvents.PlaceEvent) => {
        const { coords = [], layer, onSuccess, onFailure, pushToStack } = e.detail || {};

        try {
          const tileMap = this.editor.currentLevel.world.tileMap;

          const prevCoords = coords.map((c) => {
            const tile = tileMap.getTileAtCoords(c.x, c.y);
            const oldTileTypeId = tile?.getTileTypeId(layer) ?? 0;

            return {
              ...c,
              tileTypeId: oldTileTypeId,
            };
          });

          // compute layer transforms
          coords.forEach((coord) => {
            const tile = tileMap.getTileAtCoords(coord.x, coord.y);

            if (tile) {
              if (layer === TileLayer.L0) {
                tile.setCollision(coord.tileTypeId > 0);
              } else {
                tile.setTileTypeId(layer, coord.tileTypeId);
              }
            }
          });

          // register event
          if (pushToStack) {
            eventStackSvc.undoStack.push({
              undo: () =>
                driver.place(
                  this.editor.currentLevelId,
                  {
                    layerId: layer,
                    coords: prevCoords,
                  },
                  false
                ), //
              redo: () => driver.place(this.editor.currentLevelId, { layerId: layer, coords }, false),
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
      })
    );

    this.loaded = true;

    console.debug("Terrain mode mounted");
  }

  public unmounted(): void {
    this.events.map((callback) => {
      callback();
    });

    this.loaded = false;

    console.debug("Terrain mode unmounted");
  }

  public update(_delta: number): void {}

  public render(_alpha: number): void {}

  public handleKeyboardInput(e: KeyboardEvent, active: boolean): void {
    if (active) {
      if (matchKeyBinding(keyBindings.editor.place, e)) {
        editorStore.setTerrainMode(EditorTerrainMode.PLACE);
      } else if (matchKeyBinding(keyBindings.editor.fill, e)) {
        editorStore.setTerrainMode(EditorTerrainMode.FILL);
      } else if (matchKeyBinding(keyBindings.editor.erase, e)) {
        editorStore.setTerrainMode(EditorTerrainMode.ERASE);
      } else if (matchKeyBinding(keyBindings.editor.pick, e)) {
        editorStore.setTerrainMode(EditorTerrainMode.PICK);
      }
    }
  }

  public handleMouseInput(e: MouseEvent, active: boolean, position: vec2): void {
    const worldPos = this.editor.currentLevel.world.screenToCameraCoords(position);
    const grid = this.editor.currentLevel.world.grid;

    if (active) {
      grid.beginSelection(worldPos);
    } else {
      const coords = grid.selection;
      if (coords.length === 0) {
        return;
      }
      const tileMap = this.editor.currentLevel.world.tileMap;

      const { layerId, layers, terrainMode } = this.editor.state;

      const { tileTypeId = 0 } = layers[layerId] || {};

      if (matchMouseBinding(mouseBindings.editor.terrainMode.place, e)) {
        if (terrainMode === EditorTerrainMode.PICK) {
          const tile = tileMap.getTileAtCoords(coords[0].x, coords[0].y);
          if (tile) {
            const tileTypeId = tile.getTileTypeId(layerId);
            editorStore.setSelectedTileTypeId(tileTypeId);
          }
        } else if (terrainMode === EditorTerrainMode.PLACE) {
          driver.place(this.editor.currentLevelId, { layerId, coords: coords.map((c) => ({ ...c, tileTypeId })) }, true);
        } else if (terrainMode === EditorTerrainMode.ERASE) {
          driver.place(this.editor.currentLevelId, { layerId, coords: coords.map((c) => ({ ...c, tileTypeId: 0 })) }, true);
        } else if (terrainMode === EditorTerrainMode.FILL) {
          const targetTile = tileMap.getTileAtCoords(coords[0].x, coords[0].y);
          const tileSize = tileMap.getTileSize();

          if (targetTile) {
            const targetId = targetTile.getTileTypeId(layerId);
            const listOfCoords = tileMap.floodFill(targetTile.row, targetTile.col, (tile: ITile | undefined) => typeof tile !== "undefined" && tile.getTileTypeId(layerId) === targetId).map(({ row, col }) => ({ x: col * tileSize, y: row * tileSize }));

            driver.place(this.editor.currentLevelId, { layerId, coords: listOfCoords.map((c) => ({ ...c, tileTypeId })) }, true);
          }
        }
      } else if (matchMouseBinding(mouseBindings.editor.terrainMode.pick, e)) {
        const tile = tileMap.getTileAtCoords(coords[0].x, coords[0].y);
        if (tile) {
          const tileTypeId = tile.getTileTypeId(layerId);
          editorStore.setSelectedTileTypeId(tileTypeId);
        }
      } else if (matchMouseBinding(mouseBindings.editor.terrainMode.erase, e)) {
        driver.place(this.editor.currentLevelId, { layerId, coords: coords.map((c) => ({ ...c, tileTypeId: 0 })) }, true);
      }

      grid.endSelection();
    }
  }

  public handleMouseMove(_e: MouseEvent, position: vec2): void {
    const worldPos = this.editor.currentLevel.world.screenToCameraCoords(position);

    this.editor.currentLevel.world.grid.setCursorPosition(worldPos);
    this.editor.currentLevel.world.grid.updateSelection(worldPos);
  }
}

export default TerrainMode;
