import React from "react";
import ReactDOM from "react-dom";
import { vec2 } from "gl-matrix";

import State from "@src/states/State";
import World from "@src/world/World";
import { loadData } from "@src/world/World";

import LevelUi from "./LevelUi";

interface LevelStateOptions { id: number; }

class LevelState extends State<LevelStateOptions> {
  private world: World;

  public async init({ id }: LevelStateOptions): Promise<void> {
    console.info("Level initialized");

    this.ready = false;

    const data = await loadData(id);

    this.world = new World(data);
    await this.world.init();

    this.ready = true;

    this.initUi();
  }

  public mounted(): void {
    console.info("Level mounted");
  }

  public unmounted(): void {
    console.info("Level unmounted");

    this.flushEvents();
  }

  public update(delta: number): void {
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
  }

  public handleMouseMiddleBtnPressed(active: boolean, position: vec2): void {
    this.world.handleMouseMiddleBtnPressed(active, position);
  }

  public handleMouseRightBtnPressed(active: boolean, position: vec2): void {
    this.world.handleMouseRightBtnPressed(active, position);
  }

  public handleMouseMove(position: vec2): void {
    this.world.handleMouseMove(position);
  }

  public handleFullscreenChange(b: boolean): void {
    this.world.handleFullscreenChange(b);
  }

  public handleResize(): void {
    this.world.handleResize();
  }

  public initUi(): void {
    ReactDOM.render(React.createElement(LevelUi, {}), this.$ui);
  }
}

export default LevelState;
