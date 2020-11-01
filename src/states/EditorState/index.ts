import ReactDOM from "react-dom";
import React from "react";
import { vec2 } from "gl-matrix";
import { v4 as uuidv4 } from 'uuid';

import Entity from "@src/ECS/Entity";
import { Position, Sprite } from "@src/ECS/components";
import { POSITION_COMPONENT, SPRITE_COMPONENT } from "@src/ECS/types";

import State from "@src/states/State";
import World from "@src/world/World";
import Tile from "@src/world/Tile";

import LevelEditorUi from "@src/states/EditorState/LevelEditorUi";

import { EditorMode } from "@src/shared/models/editor.model";
import { ILayerId } from "@shared/models/tilemap.model";
import { IWorldBlueprint } from '@shared/models/world.model';


import Vector2 from "@shared/math/Vector2";

import { SaveEvent } from '@shared/events/index';
import { SAVE_EVENT, DESPAWN_EVENT, UNDO_EVENT, REDO_EVENT, SPAWN_EVENT, PLACE_EVENT, CHANGE_TILETYPE_EVENT, CHANGE_LAYER_EVENT, CHANGE_MODE_EVENT } from "@src/shared/events/constants";

import {
  dispatch,
  placeEvent, //
  TileTypeChangeEvent,
  LayerChangeEvent,
  ModeChangeEvent,
  spawnEvent,
  SpawnEvent,
  tileTypeChangeEvent,
  PlaceEvent,
  despawnEvent,
  DespawnEvent,
} from "@src/shared/events";

import { configSvc } from '@src/shared/services/ConfigService';
import eventStackSvc from "@src/shared/services/EventStackService";

interface EditorStateOptions { id: string; blueprint: Promise<IWorldBlueprint> | IWorldBlueprint; }


class EditorState extends State<EditorStateOptions> {
  private mouse: Vector2;
  
  private world: World;
  private id: string;
  private cursor: Entity;

  private selectedTileTypeIndex: number | undefined;
  private selectedLayerId: ILayerId;
  private selectedMode: EditorMode;

  public async init({ id, blueprint }: EditorStateOptions): Promise<void> {
    console.info("Editor initialized");
    
    const data = await Promise.resolve(blueprint);
    this.world = new World(data);
    this.id = id;

    this.selectedLayerId = 1;
    this.selectedMode = EditorMode.PLACE;
    this.selectedTileTypeIndex = data.level.defaultTileType;
    this.mouse = new Vector2(0, 0);

    await this.world.init();

    // show a cursor following the mouse
    this.cursor = this.world.spawn({ type: "cursor" });

    // add controllable object with the arrow keys to move the camera around
    const controllableObject = this.world.spawn({ type: "controllable_object" });
    this.world.followEntity(controllableObject);
    this.world.controlEntity(controllableObject);

    // focus on player if it exists
    const playerSpawnPoint = data.level.spawnPoints.find((spawnpoint) => spawnpoint.uuid === 'player');

    if (playerSpawnPoint) {
      const { x, y } = playerSpawnPoint.position;
      const position = controllableObject.getComponent<Position>(POSITION_COMPONENT);

      position.fromValues(x, y);
    }
  }

  public mounted(): void {
    console.info("Editor mounted");

    this.registerEvent(UNDO_EVENT, () => {
      if (!eventStackSvc.undoStack.isEmpty) {
        const action = eventStackSvc.undoStack.pop();
        eventStackSvc.redoStack.push(action);
        dispatch(action.undo);
      }
    });

    this.registerEvent(REDO_EVENT, () => {
      if (!eventStackSvc.redoStack.isEmpty) {
        const action = eventStackSvc.redoStack.pop();
        eventStackSvc.undoStack.push(action);
        dispatch(action.redo);
      }
    });

    this.registerEvent(CHANGE_MODE_EVENT, (e: ModeChangeEvent) => {
      this.selectedMode = e.detail.mode;
    });

    this.registerEvent(CHANGE_TILETYPE_EVENT, (e: TileTypeChangeEvent) => {
      this.selectedTileTypeIndex = e.detail.index;
    });

    this.registerEvent(CHANGE_LAYER_EVENT, (e: LayerChangeEvent) => {
      this.selectedLayerId = e.detail.id;
    });

    this.registerEvent(PLACE_EVENT, (e: PlaceEvent) => {
      const { coords = [], layer, tileTypeIndex, onSuccess, onFailure, pushToStack } = e.detail || {};
     
      let oldTileTypeIndex: number;

      try {
        const tileMap = this.world.tileMap;

        coords.forEach((coord) => {
          const tile = tileMap.getTileAtCoords(coord.x, coord.y);
          if (tile) {
            tile.activeSlot = layer;
            oldTileTypeIndex = tile.row * tileMap.atlas.nbCols + tile.col;
            tile.slot = tileMap.getTileTypeByIndex(tileTypeIndex);

            if (layer === 1) {
              tile.collision = tileTypeIndex !== undefined;
            }
          }
        });

        // register event
        if (oldTileTypeIndex !== tileTypeIndex) {
          if (pushToStack) {
            eventStackSvc.undoStack.push({
              undo: placeEvent(layer, oldTileTypeIndex, coords, false), //
              redo: placeEvent(layer, tileTypeIndex, coords, false),
            });
          }
        }

        if (typeof onSuccess === "function") {
          onSuccess();
        }
      } catch (e) {
        if (typeof onFailure === "function") {
          onFailure();
        }
      }
    });

    this.registerEvent(SPAWN_EVENT, (e: SpawnEvent) => {
      const { spawnpoint, onSuccess, onFailure, pushToStack } = e.detail || {};

      try {
        this.world.spawn(spawnpoint);

        if (pushToStack) {
          eventStackSvc.undoStack.push({
            undo: despawnEvent(spawnpoint.uuid),
            redo: spawnEvent(
              spawnpoint.uuid, //
              spawnpoint.type,
              spawnpoint.position,
              spawnpoint.direction,
              spawnpoint.debug,
              false
            ),
          });
        }

        if (typeof onSuccess === "function") {
          onSuccess();
        }
      } catch (e) {
        if (typeof onFailure === "function") {
          onFailure();
        }
      }
    });

    this.registerEvent(DESPAWN_EVENT, (e: DespawnEvent) => {
      const { uuid, onSuccess, onFailure } = e.detail || {};

      try {
        this.world.despawn(uuid);

        if (typeof onSuccess === "function") {
          onSuccess();
        }
      } catch (e) {
        if (typeof onFailure === "function") {
          onFailure();
        }
      }
    });

    this.registerEvent(SAVE_EVENT, (e: SaveEvent) => {
      const id = e.detail.id;

      const rows = this.world.tileMap.getNbRows();
      const cols = this.world.tileMap.getNbCols();

      const n = rows * cols;

      const tileMapLayer1 = new Array(n).fill(0);
      const tileMapLayer2 = new Array(n).fill(0);
      const tileMapLayer3 = new Array(n).fill(0);

      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
          const index = this.world.tileMap.getIndex(r, c);
          const tile = this.world.tileMap.getTileAt(r, c);

          if (tile) {
            tileMapLayer1[index] = tile.collision ? 1 : 0;
            tileMapLayer2[index] = tile.slot1 ? tile.slot1.row * this.world.tileMap.atlas.nbCols + tile.slot1.col : 0;
            tileMapLayer3[index] = tile.slot2 ? tile.slot2.row * this.world.tileMap.atlas.nbCols + tile.slot2.col : 0;  
          }
        }
      }

      configSvc.driver.save(id, {
        tileMapLayer1,
        tileMapLayer2,
        tileMapLayer3,
      });
    });

    // init ui
    ReactDOM.render(
      React.createElement(LevelEditorUi, {
        levelId: this.id,
        blueprint: this.world.blueprint,
        options: {
          mode: this.selectedMode,
          layerId: this.selectedLayerId,
          tileTypeIndex: this.selectedTileTypeIndex,
        },
      }),
      this.$ui
    );
  }

  public unmounted(): void {
    console.info("Editor unmounted");

    // remove event listeners
    this.flushEvents();

    // reset event history stack
    eventStackSvc.reset();

    // remove ui
    ReactDOM.unmountComponentAtNode(this.$ui);
  }

  public update(delta: number): void {
    const position = this.cursor.getComponent<Position>(POSITION_COMPONENT);
    const sprite = this.cursor.getComponent<Sprite>(SPRITE_COMPONENT);

    const tile = this.world.tileMap.getTileAtCoords(this.mouse.x, this.mouse.y);

    if (tile) {
      const x = tile.x1 + tile.size / 2;
      const y = tile.y1 + tile.size / 2 + 1;

      position.fromValues(x, y);
      sprite.visible = true;
    } else {
      sprite.visible = false;
    }

    this.world.update(delta);
  }

  public render(alpha: number): void {
    this.world.render(alpha);
  }

  public handleKeyboardInput(key: string, active: boolean): void {
    this.world.handleKeyboardInput(key, active);
  }

  public handleMouseLeftBtnPressed(active: boolean, position: vec2): void {
    this.world.handleMouseLeftBtnPressed(active, position);

    if (active) {
      const tileMap = this.world.tileMap;
      const coords = this.world.screenToCameraCoords(position);

      if (this.selectedMode === EditorMode.PICK) {
        const tile = tileMap.getTileAtCoords(coords.x, coords.y);
        if (tile && tile.slot) {
          dispatch(tileTypeChangeEvent(tile.slot.row * this.world.tileMap.atlas.nbCols + tile.slot.col));
        }
      } else if (this.selectedMode === EditorMode.PLACE) {
        dispatch(
          placeEvent(
            this.selectedLayerId, //
            this.selectedTileTypeIndex,
            { x: coords.x, y: coords.y }
          )
        );
      } else if (this.selectedMode === EditorMode.ERASE) {
        dispatch(
          placeEvent(
            this.selectedLayerId, //
            undefined,
            { x: coords.x, y: coords.y }
          )
        );
      } else if (this.selectedMode === EditorMode.FILL) {
        const targetTile = tileMap.getTileAtCoords(coords.x, coords.y);

        if (targetTile) {
          const targetId = targetTile.typeId;

          dispatch(
            placeEvent(
              this.selectedLayerId, //
              this.selectedTileTypeIndex,
              tileMap
                .floodFill(targetTile.row, targetTile.col, (tile: Tile) => {
                  tile.activeSlot = this.selectedLayerId;

                  return tile && tile.typeId === targetId;
                })
                .map(({ row, col }) => ({ x: col * tileMap.getTileSize(), y: row * tileMap.getTileSize() }))
            )
          );
        }
      }
    }
  }

  public handleMouseMiddleBtnPressed(active: boolean, position: vec2): void {
    this.world.handleMouseMiddleBtnPressed(active, position);

    if (active) {
      const coords = this.world.screenToCameraCoords(position);
      const tile = this.world.tileMap.getTileAtCoords(coords.x, coords.y);

      const x = tile.x1 + tile.size / 2;
      const y = tile.y1 + tile.size / 2;
      dispatch(spawnEvent(uuidv4(), "coin", { x, y }));
    }
  }

  public handleMouseRightBtnPressed(active: boolean, position: vec2): void {
    this.world.handleMouseRightBtnPressed(active, position);
  }

  public handleMouseMove(position: vec2): void {
    this.mouse = this.world.screenToCameraCoords(position);

    this.world.handleMouseMove(position);
  }

  public handleFullscreenChange(b: boolean): void {
    this.world.handleFullscreenChange(b);
  }

  public handleResize(): void {
    this.world.handleResize();
  }
}

export default EditorState;
