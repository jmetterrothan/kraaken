import React from "react";
import ReactDOM from "react-dom";
import { vec2 } from "gl-matrix";

import State from "@src/states/State";
import World from "@src/world/World";

import { IWorldBlueprint } from '@shared/models/world.model';

import LevelUi from "./LevelUi";

interface LevelStateOptions { worldBlueprint: Promise<IWorldBlueprint> | IWorldBlueprint; }

class LevelState extends State<LevelStateOptions> {
  private world: World;

  public async init({ worldBlueprint }: LevelStateOptions): Promise<void> {
    console.info("Level initialized");

    const data = await Promise.resolve(worldBlueprint);
    this.world = new World(data);

    await this.world.init();
    
    this.world.followEntity(this.world.player);
    this.world.controlEntity(this.world.player);
    this.world.aimEntity = this.world.spawn({ type: "crosshair" });
  }

  public mounted(): void {
    console.info("Level mounted");

    ReactDOM.render(React.createElement(LevelUi, {}), this.$ui);
  }

  public unmounted(): void {
    console.info("Level unmounted");

    // remove ui
    ReactDOM.unmountComponentAtNode(this.$ui);

    // remove event listeners
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
}

export default LevelState;
