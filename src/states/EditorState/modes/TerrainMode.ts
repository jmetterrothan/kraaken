import { vec2 } from "gl-matrix";

import { Position } from "@src/ECS/components";

import EditorState from '@src/states/EditorState';

import * as GameEventTypes from "@shared/events/constants";
import dispatch, * as GameEvents from '@shared/events';

import eventStackSvc from "@shared/services/EventStackService";

import { EditorTerrainMode } from '@shared/models/editor.model';
import { ITile } from '@shared/models/tilemap.model';

import editorStore from "../editorStore";

class TerrainMode {
  private editor: EditorState;

  public constructor(editor: EditorState) {
    this.editor = editor;
  }
  
  public mounted(): void {
    this.editor.registerEvent(GameEventTypes.PLACE_EVENT, (e: GameEvents.PlaceEvent) => {
      const { coords = [], layer, tileTypeId, onSuccess, onFailure, pushToStack } = e.detail || {};
    
      if (typeof tileTypeId === 'undefined') {
        throw new Error('Undefined tile type index');
      }

      let oldTileTypeId: number;

      try {
        const tileMap = this.editor.world.tileMap;

        // compute layer transforms
        coords.forEach((coord) => {
          const tile = tileMap.getTileAtCoords(coord.x, coord.y);
 
          if (tile) {
            oldTileTypeId = tile.getTileTypeId(layer);
            tile.setTileTypeId(layer, tileTypeId);
          }
        });

        // register event
        if (oldTileTypeId !== tileTypeId && pushToStack) {
          eventStackSvc.undoStack.push({
            undo: GameEvents.placeEvent(layer, oldTileTypeId, coords, false), //
            redo: GameEvents.placeEvent(layer, tileTypeId, coords, false),
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

  public unmounted(): void {

  }

  public update(delta: number): void {
    const cursorPosition = this.editor.cursor.getComponent(Position);
    const cellCursorPosition = this.editor.cellCursor.getComponent(Position);
    // const sprite = this.editor.cursor.getComponent<Sprite>(SPRITE_COMPONENT);
    
    cursorPosition.fromValues(this.editor.mouse.x, this.editor.mouse.y);

    const tile = this.editor.world.tileMap.getTileAtCoords(this.editor.mouse.x, this.editor.mouse.y);

    if (tile) {
      const x = tile.position.x + tile.size / 2;
      const y = tile.position.y + tile.size / 2 + 1;
      cellCursorPosition.fromValues(x, y);
    }
  }

  public render(alpha: number): void {

  }

  public handleKeyboardInput(key: string, active: boolean): void {
    
  }

  public handleMouseLeftBtnPressed(active: boolean, position: vec2): void {
    if (active) {
      const tileMap = this.editor.world.tileMap;
      const coords = this.editor.world.screenToCameraCoords(position);

      if (this.editor.state.terrainMode === EditorTerrainMode.PICK) {
        const tile = tileMap.getTileAtCoords(coords.x, coords.y);
        if (tile) {
          const tileTypeId = tile.getTileTypeId(this.editor.state.layerId);
          editorStore.setSelectedTileTypeId(tileTypeId);
        }
      } else if (this.editor.state.terrainMode === EditorTerrainMode.PLACE) {
        dispatch(
          GameEvents.placeEvent(
            this.editor.state.layerId, //
            this.editor.state.tileTypeId,
            { x: coords.x, y: coords.y }
          )
        );
      } else if (this.editor.state.terrainMode === EditorTerrainMode.ERASE) {
        dispatch(
          GameEvents.placeEvent(
            this.editor.state.layerId, //
            0,
            { x: coords.x, y: coords.y }
          )
        );
      } else if (this.editor.state.terrainMode === EditorTerrainMode.FILL) {
        const targetTile = tileMap.getTileAtCoords(coords.x, coords.y);

        if (targetTile) {
          const targetId = targetTile.getTileTypeId(this.editor.state.layerId);

          dispatch(
            GameEvents.placeEvent(
              this.editor.state.layerId, //
              this.editor.state.tileTypeId,
              tileMap
                .floodFill(targetTile.row, targetTile.col, (tile: ITile) => {
                  return tile && tile.getTileTypeId(this.editor.state.layerId) === targetId;
                })
                .map(({ row, col }) => ({ x: col * tileMap.getTileSize(), y: row * tileMap.getTileSize() }))
            )
          );
        }
      }
    }
  }

  public handleMouseMiddleBtnPressed(active: boolean, position: vec2): void {
    
  }

  public handleMouseRightBtnPressed(active: boolean, position: vec2): void {
    
  }

  public handleMouseMove(position: vec2): void {

  }
}

export default TerrainMode;
