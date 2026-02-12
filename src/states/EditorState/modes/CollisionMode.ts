import { Entity } from "@src/ECS";

import EditorState from "@src/states/EditorState";

import * as GameEventTypes from "@src/shared/events/constants";
import * as GameEvents from "@src/shared/events";

import { TileLayer } from "@src/shared/models/tilemap.model";

import { driver } from "@src/shared/drivers/DriverFactory";

import { vec2 } from "gl-matrix";

import mouseBindings, { matchMouseBinding } from "@src/mouseBindings";
import { debugSvc } from "@src/shared/services/Debug";
import { DebugFlag } from "@src/enums/DebugFlag";
import eventStackSvc from "@src/shared/services/EventStackService";

class CollisionMode {
  public focusedEntity: Entity | undefined;
  public selectedEntity: Entity | undefined;

  private editor: EditorState;

  private events: Array<() => void>;

  public constructor(editor: EditorState) {
    this.editor = editor;

    this.events = [];
  }

  public mounted(): void {
    debugSvc.set(DebugFlag.GRID, true);
    debugSvc.set(DebugFlag.COLLISION, true);
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
              tile.setCollision(coord.tileTypeId > 0);
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
  }

  public unmounted(): void {
    this.events.map((callback) => {
      callback();
    });
  }

  public update(_delta: number): void {}

  public render(_alpha: number): void {}

  public handleKeyboardInput(_e: KeyboardEvent, _active: boolean): void {}

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

      if (matchMouseBinding(mouseBindings.editor.collisionMode.place, e)) {
        driver.place(this.editor.currentLevelId, { layerId: TileLayer.L0, coords: coords.map((c) => ({ ...c, tileTypeId: 1 })) }, true);
      } else if (matchMouseBinding(mouseBindings.editor.collisionMode.erase, e)) {
        driver.place(this.editor.currentLevelId, { layerId: TileLayer.L0, coords: coords.map((c) => ({ ...c, tileTypeId: 0 })) }, true);
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

export default CollisionMode;
