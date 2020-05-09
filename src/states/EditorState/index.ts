import ReactDOM from "react-dom";
import React from "react";
import { vec2 } from "gl-matrix";

import State from "@src/states/State";
import World from "@src/world/World";
import Tile from "@src/world/Tile";
import { loadData } from "@src/world/World";

import EditorUi from "@src/states/EditorState/EditorUi";

import { EditorMode } from "@src/shared/models/editor.model";
import { ILayerId } from "@shared/models/tilemap.model";

import { DESPAWN_EVENT, UNDO_EVENT, REDO_EVENT, SPAWN_EVENT, PLACE_EVENT, CHANGE_TILETYPE_EVENT, CHANGE_LAYER_EVENT, CHANGE_MODE_EVENT } from "@src/shared/events/constants";

import {
  dispatch,
  placeEvent, //
  TileTypeChangeEvent,
  LayerChangeEvent,
  ModeChangeEvent,
  spawnEvent,
  SpawnEvent,
  tileTypeChange,
  PlaceEvent,
  despawnEvent,
  DespawnEvent,
} from "@src/shared/events";

import Fifo from "@src/shared/utility/Fifo";
import * as utility from "@src/shared/utility/Utility";

class EditorState extends State {
  public readonly id: number;

  private ready: boolean;
  private world: World;

  private undoStack: Fifo<{ undo: CustomEvent<any>; redo: CustomEvent<any> }>;
  private redoStack: Fifo<{ undo: CustomEvent<any>; redo: CustomEvent<any> }>;

  private selectedTileTypeId: string | undefined;
  private selectedLayerId: ILayerId;
  private selectedMode: EditorMode;

  constructor(id: number = 1) {
    super();

    this.id = id;
    this.ready = false;
  }

  public async init() {
    console.info("Editor initialized");

    const data = await loadData(this.id);

    this.selectedLayerId = 1;
    this.selectedMode = EditorMode.PLACE;
    this.selectedTileTypeId = data.level.tileMap.defaultTileType;

    this.world = new World(data);

    this.undoStack = new Fifo();
    this.redoStack = new Fifo();

    await this.world.init();

    this.ready = true;

    this.initEditorUi();

    window.addEventListener(UNDO_EVENT, () => {
      if (!this.undoStack.isEmpty) {
        const action = this.undoStack.pop();
        this.redoStack.push(action);
        dispatch(action.undo);
      }
    });

    window.addEventListener(REDO_EVENT, () => {
      if (!this.redoStack.isEmpty) {
        const action = this.redoStack.pop();
        this.undoStack.push(action);
        dispatch(action.redo);
      }
    });

    window.addEventListener(CHANGE_MODE_EVENT, (e: ModeChangeEvent) => {
      this.selectedMode = e.detail.mode;
    });

    window.addEventListener(CHANGE_TILETYPE_EVENT, (e: TileTypeChangeEvent) => {
      this.selectedTileTypeId = e.detail.id;
    });

    window.addEventListener(CHANGE_LAYER_EVENT, (e: LayerChangeEvent) => {
      this.selectedLayerId = e.detail.id;
    });

    window.addEventListener(PLACE_EVENT, (e: PlaceEvent) => {
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

    window.addEventListener(SPAWN_EVENT, (e: SpawnEvent) => {
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

    window.addEventListener(DESPAWN_EVENT, (e: DespawnEvent) => {
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
  }

  public initEditorUi() {
    const $ui = document.createElement("div");
    $ui.classList.add("kraken-ui");

    document.getElementById("game").querySelector(".kraken").appendChild($ui);

    ReactDOM.render(
      React.createElement(EditorUi, {
        level: this.world.blueprint.level, //
        sprites: this.world.blueprint.resources,
        options: {
          mode: this.selectedMode,
          layerId: this.selectedLayerId,
          tileTypeId: this.selectedTileTypeId,
        },
      }),
      $ui
    );
  }

  public mounted() {
    console.info("Editor mounted");
  }

  public unmounted() {
    console.info("Editor unmounted");
  }

  public update(delta: number) {
    if (this.ready) {
      this.world.update(delta);
    }
  }

  public render(alpha: number) {
    if (this.ready) {
      this.world.render(alpha);
    }
  }

  public handleKeyboardInput(key: string, active: boolean) {
    if (this.ready) {
      this.world.handleKeyboardInput(key, active);
    }
  }

  public handleMouseLeftBtnPressed(active: boolean, position: vec2) {
    if (this.ready) {
      this.world.handleMouseLeftBtnPressed(active, position);

      if (active) {
        const tileMap = this.world.tileMap;
        const coords = this.world.screenToCameraCoords(position);

        if (this.selectedMode === EditorMode.PICK) {
          const tile = tileMap.getTileAtCoords(coords.x, coords.y);
          if (tile && tile.typeId) {
            dispatch(tileTypeChange(tile.typeId));
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
  }

  public handleMouseMiddleBtnPressed(active: boolean, position: vec2) {
    if (this.ready) {
      this.world.handleMouseMiddleBtnPressed(active, position);

      if (active) {
        const coords = this.world.screenToCameraCoords(position);
        dispatch(spawnEvent(utility.uuid(), "energy_bolt", coords));
      }
    }
  }

  public handleMouseRightBtnPressed(active: boolean, position: vec2) {
    if (this.ready) {
      this.world.handleMouseRightBtnPressed(active, position);
    }
  }

  public handleMouseMove(position: vec2) {
    if (this.ready) {
      this.world.handleMouseMove(position);
    }
  }

  public handleFullscreenChange(b: boolean) {
    if (this.ready) {
      this.world.handleFullscreenChange(b);
    }
  }

  public handleResize() {
    if (this.ready) {
      this.world.handleResize();
    }
  }
}

export default EditorState;
