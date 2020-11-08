import React from "react";
import ReactDOM from "react-dom";
import { vec2 } from "gl-matrix";

import State from "@src/states/State";
import World from "@src/world/World";

import dispatch, * as GameEvents from '@shared/events';

import { IWorldBlueprint } from '@shared/models/world.model';

import LevelUi from "./LevelUi";

interface LevelStateOptions { id: string; blueprint: Promise<IWorldBlueprint> | IWorldBlueprint; }

class LevelState extends State<LevelStateOptions> {
  private id: string;
  private world: World;

  public async init({ id, blueprint }: LevelStateOptions): Promise<void> {
    console.info("Level initialized");

    const data = await Promise.resolve(blueprint);
    this.world = new World(data);
    this.id = id;

    await this.world.init(true);
    
    this.world.followEntity(this.world.player);
    this.world.controlEntity(this.world.player);
    this.world.aimEntity = this.world.spawn({ type: "crosshair" });

    dispatch(GameEvents.zoomEvent(5));
  }

  public mounted(): void {
    console.info("Level mounted");

    ReactDOM.render(React.createElement(LevelUi, { levelId: this.id }), this.$ui);
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
 
    // change zoom level to better fit the screen size
    if (b) { 
      dispatch(GameEvents.zoomEvent(5));
    } else {
      dispatch(GameEvents.zoomEvent(4));
    }
  }

  public handleResize(): void {
    this.world.handleResize();
  }
}

export default LevelState;
