import ReactDOM from "react-dom";
import React from "react";
import { vec2 } from "gl-matrix";

import Entity from "@src/ECS/Entity";
import { Camera, Position } from "@src/ECS/components";
import { CAMERA_COMPONENT, POSITION_COMPONENT } from "@src/ECS/types";

import State from "@src/states/State";
import World from "@src/world/World";
import Grid  from '@src/shared/Grid';

import LevelEditorUi from "@src/states/EditorState/LevelEditorUi";

import { EditorMode } from '@shared/models/editor.model';
import { IWorldBlueprint } from '@shared/models/world.model';

import Vector2 from "@shared/math/Vector2";

import * as GameEventTypes from "@src/shared/events/constants";
import dispatch, * as GameEvents from '@shared/events';

import { configSvc } from '@src/shared/services/ConfigService';
import eventStackSvc from "@src/shared/services/EventStackService";

import TerrainMode from './modes/TerrainMode';
import EntityMode from './modes/EntityMode';

import editorStore, { IEditorStoreState } from './editorStore';

interface EditorStateOptions { id: string; blueprint: Promise<IWorldBlueprint> | IWorldBlueprint; }


class EditorState extends State<EditorStateOptions> {
  public mouse: Vector2;
  
  public world: World;
  public id: string;
  public cursor: Entity;
  public cellCursor: Entity;
  public grid: Grid;

  public state: IEditorStoreState;

  public modes: {
    [EditorMode.TERRAIN]: TerrainMode,
    [EditorMode.ENTITY]: EntityMode,
  };

  public async init({ id, blueprint }: EditorStateOptions): Promise<void> {
    console.info("Editor initialized");

    const data = await Promise.resolve(blueprint);
    this.world = new World(await Promise.resolve(blueprint));
    this.id = id;

    this.state = editorStore.initialState;   
    
    editorStore.subscribe((state) => this.state = state);
    editorStore.init();

    this.mouse = new Vector2(0, 0);

    await this.world.init();

    this.modes = {
      [EditorMode.TERRAIN]: new TerrainMode(this),
      [EditorMode.ENTITY]: new EntityMode(this),
    }

    this.grid = new Grid();
    this.grid.init();

    // show a cursor following the mouse
    this.cursor = this.world.spawn({ type: "cursor" });
    this.cellCursor = this.world.spawn({type: 'cursor3' });

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

    this.registerEvent(GameEventTypes.SAVE_EVENT, (e: GameEvents.SaveEvent) => {
      configSvc.driver.save(e.detail.id, this.world.blueprint);
    });     
    
    this.modes[EditorMode.ENTITY].mounted();
    this.modes[EditorMode.TERRAIN].mounted();

    // init ui
    ReactDOM.render(
      React.createElement(LevelEditorUi, {
        levelId: this.id,
        blueprint: this.world.blueprint,
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
  
    this.modes[EditorMode.ENTITY].unmounted();
    this.modes[EditorMode.TERRAIN].unmounted();
    
    // remove ui
    ReactDOM.unmountComponentAtNode(this.$ui);
  }

  public update(delta: number): void {
    this.world.update(delta);
    this.currentMode.update(delta);
  }

  public render(alpha: number): void {
    const camera = this.world.camera.getComponent<Camera>(CAMERA_COMPONENT);
    
    // TODO: FIX - GRID ONLY LINE UP IN FULLSCREEN
    this.grid.use();
    this.grid.render(this.world.projectionMatrix, camera.viewMatrix, [camera.viewMatrix[6], camera.viewMatrix[7]]);
    
    this.world.render(alpha);
    this.currentMode.render(alpha);
  }

  public handleKeyboardInput(key: string, active: boolean): void {
    this.world.handleKeyboardInput(key, active);
    this.currentMode.handleKeyboardInput(key, active);
  }

  public handleMouseLeftBtnPressed(active: boolean, position: vec2): void {
    this.world.handleMouseLeftBtnPressed(active, position);
    this.currentMode.handleMouseLeftBtnPressed(active, position);
  }

  public handleMouseMiddleBtnPressed(active: boolean, position: vec2): void {
    this.world.handleMouseMiddleBtnPressed(active, position);
    this.currentMode.handleMouseMiddleBtnPressed(active, position);
  }

  public handleMouseRightBtnPressed(active: boolean, position: vec2): void {
    this.world.handleMouseRightBtnPressed(active, position);
    this.currentMode.handleMouseRightBtnPressed(active, position);
  }

  public handleMouseMove(position: vec2): void {
    this.mouse = this.world.screenToCameraCoords(position);

    this.world.handleMouseMove(position);
    this.currentMode.handleMouseMove(position);
  }

  public handleFullscreenChange(b: boolean): void {
    this.world.handleFullscreenChange(b);
  }

  public handleResize(): void {
    this.world.handleResize();
  }

  public get currentMode(): any {
    return this.modes[this.state.mode];
  }
}

export default EditorState;
