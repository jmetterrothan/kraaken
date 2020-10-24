import React from "react";
import ReactDOM from "react-dom";
import { vec2 } from "gl-matrix";

import State from "@src/states/State";
import World from "@src/world/World";
import { loadData } from "@src/world/World";

import LevelUi from "./LevelUi";

class LevelState extends State<{ id: string; }> {
  private world: World;

  public async init({ id }) {
    console.info("Level initialized");

    this.ready = false;

    const data = await loadData(id);

    this.world = new World(data);
    await this.world.init();

    this.ready = true;

    this.initUi();
  }

  public mounted() {
    console.info("Level mounted");
  }

  public unmounted() {
    console.info("Level unmounted");

    this.flushEvents();
  }

  public update(delta: number) {
    this.world.update(delta);
  }

  public render(alpha: number) {
    this.world.render(alpha);
  }

  public handleKeyboardInput(key: string, active: boolean) {
    this.world.handleKeyboardInput(key, active);
  }

  public handleMouseLeftBtnPressed(active: boolean, position: vec2) {
    this.world.handleMouseLeftBtnPressed(active, position);
  }

  public handleMouseMiddleBtnPressed(active: boolean, position: vec2) {
    this.world.handleMouseMiddleBtnPressed(active, position);
  }

  public handleMouseRightBtnPressed(active: boolean, position: vec2) {
    this.world.handleMouseRightBtnPressed(active, position);
  }

  public handleMouseMove(position: vec2) {
    this.world.handleMouseMove(position);
  }

  public handleFullscreenChange(b: boolean) {
    this.world.handleFullscreenChange(b);
  }

  public handleResize() {
    this.world.handleResize();
  }

  public initUi() {
    ReactDOM.render(React.createElement(LevelUi, {}), this.$ui);
  }
}

export default LevelState;
