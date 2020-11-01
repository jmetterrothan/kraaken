import ReactDOM from "react-dom";
import React from "react";
import { vec2 } from "gl-matrix";
import { v4 as uuidv4 } from 'uuid';

import Entity from "@src/ECS/Entity";
import { Camera, Position, Sprite } from "@src/ECS/components";
import { CAMERA_COMPONENT, POSITION_COMPONENT, SPRITE_COMPONENT } from "@src/ECS/types";

import State from "@src/states/State";
import World from "@src/world/World";
import Tile from "@src/world/Tile";
import Grid  from '@src/animation/Grid';

import LevelEditorUi from "@src/states/EditorState/LevelEditorUi";

import { EditorMode } from "@src/shared/models/editor.model";
import { ILayerId } from "@shared/models/tilemap.model";
import { IWorldBlueprint } from '@shared/models/world.model';


import Vector2 from "@shared/math/Vector2";

import * as GameEventTypes from "@src/shared/events/constants";
import dispatch, * as GameEvents from '@shared/events';

import { configSvc } from '@src/shared/services/ConfigService';
import eventStackSvc from "@src/shared/services/EventStackService";

interface EditorStateOptions { id: string; blueprint: Promise<IWorldBlueprint> | IWorldBlueprint; }


class EditorState extends State<EditorStateOptions> {
  private mouse: Vector2;
  
  private world: World;
  private id: string;
  private cursor: Entity;
  private grid: Grid;

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

    this.grid = new Grid();
    this.grid.init();

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

    dispatch(GameEvents.zoomEvent(4));
  }

  public mounted(): void {
    console.info("Editor mounted");

    this.registerEvent(GameEventTypes.UNDO_EVENT, () => {
      if (!eventStackSvc.undoStack.isEmpty) {
        const action = eventStackSvc.undoStack.pop();
        eventStackSvc.redoStack.push(action);
        dispatch(action.undo);
      }
    });

    this.registerEvent(GameEventTypes.REDO_EVENT, () => {
      if (!eventStackSvc.redoStack.isEmpty) {
        const action = eventStackSvc.redoStack.pop();
        eventStackSvc.undoStack.push(action);
        dispatch(action.redo);
      }
    });

    this.registerEvent(GameEventTypes.CHANGE_MODE_EVENT, (e: GameEvents.ModeChangeEvent) => {
      this.selectedMode = e.detail.mode;
    });

    this.registerEvent(GameEventTypes.CHANGE_TILETYPE_EVENT, (e: GameEvents.TileTypeChangeEvent) => {
      this.selectedTileTypeIndex = e.detail.index;
    });

    this.registerEvent(GameEventTypes.CHANGE_LAYER_EVENT, (e: GameEvents.LayerChangeEvent) => {
      this.selectedLayerId = e.detail.id;
    });

    this.registerEvent(GameEventTypes.PLACE_EVENT, (e: GameEvents.PlaceEvent) => {
      const { coords = [], layer, tileTypeIndex, onSuccess, onFailure, pushToStack } = e.detail || {};
     
      let oldTileTypeIndex: number;

      try {
        const tileMap = this.world.tileMap;

        coords.forEach((coord) => {
          const tile = tileMap.getTileAtCoords(coord.x, coord.y);
          
          if (tile) {
            tile.activeSlot = layer;
            oldTileTypeIndex = tile.slot ? tile.slot.row * tileMap.atlas.nbCols + tile.slot.col : 0;

            tile.slot = tileMap.getTileTypeByIndex(tileTypeIndex);

            if (layer === 1) {
              tile.collision = tileTypeIndex > 0;
            }
          }
        });

        // register event
        if (oldTileTypeIndex !== tileTypeIndex) {
          if (pushToStack) {
            eventStackSvc.undoStack.push({
              undo: GameEvents.placeEvent(layer, oldTileTypeIndex, coords, false), //
              redo: GameEvents.placeEvent(layer, tileTypeIndex, coords, false),
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

    this.registerEvent(GameEventTypes.SPAWN_EVENT, (e: GameEvents.SpawnEvent) => {
      const { spawnpoint, onSuccess, onFailure, pushToStack } = e.detail || {};

      try {
        this.world.spawn(spawnpoint);

        if (pushToStack) {
          eventStackSvc.undoStack.push({
            undo: GameEvents.despawnEvent(spawnpoint.uuid),
            redo: GameEvents.spawnEvent(
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

    this.registerEvent(GameEventTypes.DESPAWN_EVENT, (e: GameEvents.DespawnEvent) => {
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

    this.registerEvent(GameEventTypes.SAVE_EVENT, (e: GameEvents.SaveEvent) => {
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
          scale: 5,
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
    const cameraComponent = this.world.camera.getComponent<Camera>(CAMERA_COMPONENT);
    this.grid.use();
    this.grid.render(this.world.projectionMatrix, cameraComponent.viewMatrix);
    
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
          dispatch(GameEvents.tileTypeChangeEvent(tile.slot.row * this.world.tileMap.atlas.nbCols + tile.slot.col));
        }
      } else if (this.selectedMode === EditorMode.PLACE) {
        dispatch(
          GameEvents.placeEvent(
            this.selectedLayerId, //
            this.selectedTileTypeIndex,
            { x: coords.x, y: coords.y }
          )
        );
      } else if (this.selectedMode === EditorMode.ERASE) {
        dispatch(
          GameEvents.placeEvent(
            this.selectedLayerId, //
            0,
            { x: coords.x, y: coords.y }
          )
        );
      } else if (this.selectedMode === EditorMode.FILL) {
        const targetTile = tileMap.getTileAtCoords(coords.x, coords.y);

        if (targetTile) {
          const targetId = targetTile.typeId;

          dispatch(
            GameEvents.placeEvent(
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
      dispatch(GameEvents.spawnEvent(uuidv4(), "health_potion", { x, y }));
    }
  }

  public handleMouseRightBtnPressed(active: boolean, position: vec2): void {
    this.world.handleMouseRightBtnPressed(active, position);

    if (active) {
      if (this.selectedMode === EditorMode.PLACE || this.selectedMode === EditorMode.ERASE) {
        dispatch(GameEvents.undoEvent());
      }
    }
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
