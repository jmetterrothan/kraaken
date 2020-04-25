import ReactDOM from "react-dom";
import React from "react";
import { vec2 } from "gl-matrix";

import Level from "@src/world/Level";
import State from "@src/states/State";
import World from "@src/world/World";
import Tile from "@src/world/Tile";

import { EditorMode } from "@src/shared/models/editor.model";
import { ILayerId } from "@shared/models/tilemap.model";

import EditorUi from "@src/states/EditorState/EditorUi";

import {
  placeEvent, //
  SPAWN_EVENT,
  CHANGE_MODE_EVENT,
  CHANGE_TILETYPE_EVENT,
  CHANGE_LAYER_EVENT,
  TileTypeChangeEvent,
  LayerChangeEvent,
  ModeChangeEvent,
  spawnEvent,
  SpawnEvent,
  tileTypeChange,
} from "@src/shared/ui/events";

import * as utility from "@src/shared/utility/Utility";

class EditorState extends State {
  public readonly id: number;
  private level: Level;
  private ready: boolean;

  private world: World;

  private selectedTileTypeId: string | undefined;
  private selectedLayerId: ILayerId;
  private selectedMode: EditorMode;

  constructor(id: number = 1) {
    super();

    this.id = id;
    this.ready = false;

    this.selectedTileTypeId = "20:1";
    this.selectedLayerId = 1;
    this.selectedMode = EditorMode.FILL;
  }

  public async init() {
    console.info("Editor initialized");

    const data = await Level.loadData(this.id);
    this.level = new Level(this.id, data);
    this.world = new World(this.level);

    await this.world.init();

    this.ready = true;

    this.initEditorUi();

    window.addEventListener(CHANGE_MODE_EVENT, (e: ModeChangeEvent) => {
      this.selectedMode = e.detail.mode;
    });

    window.addEventListener(CHANGE_TILETYPE_EVENT, (e: TileTypeChangeEvent) => {
      this.selectedTileTypeId = e.detail.id;
    });

    window.addEventListener(CHANGE_LAYER_EVENT, (e: LayerChangeEvent) => {
      this.selectedLayerId = e.detail.id;
    });

    window.addEventListener(SPAWN_EVENT, (e: SpawnEvent) => {
      const { type, spawnpoint, onSuccess, onFailure } = e.detail || {};

      try {
        this.world.spawn(type, spawnpoint);

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
        level: this.level.world, //
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
      const camera = this.world.getCamera();
      const tileMap = this.world.getTileMap();

      this.world.handleMouseLeftBtnPressed(active, position);

      if (active) {
        const coords = camera.screenToCameraCoords(position);

        if (this.selectedMode === EditorMode.PICK) {
          const tile = tileMap.getTileAtCoords(coords.x, coords.y);
          if (tile && tile.typeId) {
            window.dispatchEvent(tileTypeChange(tile.typeId));
          }
        } else if (this.selectedMode === EditorMode.PLACE) {
          window.dispatchEvent(
            placeEvent(
              this.selectedLayerId, //
              this.selectedTileTypeId,
              { x: coords.x, y: coords.y }
            )
          );
        } else if (this.selectedMode === EditorMode.ERASE) {
          window.dispatchEvent(
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

            window.dispatchEvent(
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
    }
  }

  public handleMouseRightBtnPressed(active: boolean, position: vec2) {
    if (this.ready) {
      this.world.handleMouseRightBtnPressed(active, position);

      const camera = this.world.getCamera();
      const coords = camera.screenToCameraCoords(position);

      window.dispatchEvent(spawnEvent(utility.uuid(), "loot", "health_potion", coords));
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
