import ReactDOM from "react-dom";
import React from "react";
import { vec2 } from "gl-matrix";

import Level from "@src/world/Level";
import State from "@src/states/State";
import World from "@src/world/World";

import LevelStateUi from "@src/shared/ui/LevelStateUi";

class LevelState extends State {
  public readonly id: number;
  private level: Level;
  private ready: boolean;

  private world: World;

  constructor(id: number = 1) {
    super();

    this.id = id;
    this.ready = false;
  }

  public async init() {
    console.info("Level initialized");

    const data = await Level.loadData(this.id);
    this.level = new Level(this.id, data);
    this.world = new World(this.level);

    await this.world.init();

    this.ready = true;

    /*
    const $ui = document.createElement("div");
    $ui.classList.add("kraken-ui");

    document.getElementById("game").querySelector(".kraken-wrapper").appendChild($ui);

    ReactDOM.render(
      React.createElement(LevelStateUi, { level: this.level.world }),
      $ui
    );
    */
  }

  public mounted() {
    console.info("Level mounted");
  }

  public unmounted() {
    console.info("Level unmounted");
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

export default LevelState;
