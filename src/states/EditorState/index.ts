import ReactDOM from "react-dom";
import React from "react";
import { vec2 } from "gl-matrix";
import { v4 as uuidv4 } from 'uuid';

import Entity from "@src/ECS/Entity";
import { Position, Sprite } from "@src/ECS/components";
import { POSITION_COMPONENT, SPRITE_COMPONENT } from "@src/ECS/types";

import State from "@src/states/State";
import World, { loadData } from "@src/world/World";
import Tile from "@src/world/Tile";

import EditorUi from "@src/states/EditorState/EditorUi";

import { EditorMode } from "@src/shared/models/editor.model";
import { ILayerId } from "@shared/models/tilemap.model";

import Vector2 from "@shared/math/Vector2";

import { DESPAWN_EVENT, UNDO_EVENT, REDO_EVENT, SPAWN_EVENT, PLACE_EVENT, CHANGE_TILETYPE_EVENT, CHANGE_LAYER_EVENT, CHANGE_MODE_EVENT } from "@src/shared/events/constants";

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

import Fifo from "@src/shared/utility/Fifo";

interface EditorStateOptions { id: number; }

interface EventStackItem { undo: CustomEvent<any>; redo: CustomEvent<any> }

class EditorState extends State<EditorStateOptions> {
  private mouse: Vector2;

  private world: World;
  private cursor: Entity;

  private undoStack: Fifo<EventStackItem>;
  private redoStack: Fifo<EventStackItem>;

  private selectedTileTypeId: string | undefined;
  private selectedLayerId: ILayerId;
  private selectedMode: EditorMode;

  public async init({ id }: EditorStateOptions): Promise<void> {
    console.info("Editor initialized");

    const data = await loadData(id);
    
    this.world = new World(data);
    this.selectedLayerId = 1;
    this.selectedMode = EditorMode.PLACE;
    this.selectedTileTypeId = data.level.tileMap.defaultTileType;
    this.mouse = new Vector2(0, 0);
    this.undoStack = new Fifo();
    this.redoStack = new Fifo();

    await this.world.init();

    this.cursor = this.world.spawn({ type: "cursor" });

    const dummy = this.world.spawn({ type: "dummy" });
    this.world.followEntity(dummy);
    this.world.controlEntity(dummy);
  }

  public mounted(): void {
    console.info("Editor mounted");

    this.registerEvent(UNDO_EVENT, () => {
      if (!this.undoStack.isEmpty) {
        const action = this.undoStack.pop();
        this.redoStack.push(action);
        dispatch(action.undo);
      }
    });

    this.registerEvent(REDO_EVENT, () => {
      if (!this.redoStack.isEmpty) {
        const action = this.redoStack.pop();
        this.undoStack.push(action);
        dispatch(action.redo);
      }
    });

    this.registerEvent(CHANGE_MODE_EVENT, (e: ModeChangeEvent) => {
      this.selectedMode = e.detail.mode;
    });

    this.registerEvent(CHANGE_TILETYPE_EVENT, (e: TileTypeChangeEvent) => {
      this.selectedTileTypeId = e.detail.id;
    });

    this.registerEvent(CHANGE_LAYER_EVENT, (e: LayerChangeEvent) => {
      this.selectedLayerId = e.detail.id;
    });

    this.registerEvent(PLACE_EVENT, (e: PlaceEvent) => {
      const { coords = [], layer, tileType, onSuccess, onFailure, pushToStack } = e.detail || {};

      let oldTileType: string;

      try {
        const tileMap = this.world.tileMap;

        coords.forEach((coord) => {
          const tile = tileMap.getTileAtCoords(coord.x, coord.y);
          if (tile) {
            tile.activeSlot = layer;
            oldTileType = tile.typeId;
            tile.slot = tileMap.getTileType(tileType);

            if (layer === 1) {
              tile.collision = tileType !== undefined;
            }
          }
        });

        // register event
        if (oldTileType !== tileType) {
          if (pushToStack) {
            this.undoStack.push({
              undo: placeEvent(layer, oldTileType, coords, false), //
              redo: placeEvent(layer, tileType, coords, false),
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
          this.undoStack.push({
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

    // init ui
    ReactDOM.render(
      React.createElement(EditorUi, {
        level: this.world.blueprint.level, //
        sprites: this.world.blueprint.resources.sprites,
        sounds: this.world.blueprint.resources.sounds,
        options: {
          mode: this.selectedMode,
          layerId: this.selectedLayerId,
          tileTypeId: this.selectedTileTypeId,
        },
      }),
      this.$ui
    );
  }

  public unmounted(): void {
    console.info("Editor unmounted");

    // remove event listeners
    this.flushEvents();

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
        if (tile && tile.typeId) {
          dispatch(tileTypeChangeEvent(tile.typeId));
        }
      } else if (this.selectedMode === EditorMode.PLACE) {
        dispatch(
          placeEvent(
            this.selectedLayerId, //
            this.selectedTileTypeId,
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
              this.selectedTileTypeId,
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
