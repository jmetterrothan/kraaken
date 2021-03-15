import { configSvc } from "./../../shared/services/ConfigService";
import ReactDOM from "react-dom";
import React from "react";
import { mat3, vec2 } from "gl-matrix";
import { v4 as uuidv4 } from "uuid";

import { Entity } from "@src/ECS";
import * as Components from "@src/ECS/components";
import * as Systems from "@src/ECS/systems";

import State from "@src/states/State";
import World from "@src/world/World";
import Grid from "@src/shared/Grid";

import LevelEditorUi from "@src/states/EditorState/LevelEditorUi";

import { EditorMode } from "@shared/models/editor.model";
import { ILevelBlueprint } from "@shared/models/world.model";

import Vector2 from "@shared/math/Vector2";

import * as GameEventTypes from "@src/shared/events/constants";
import * as GameEvents from "@shared/events";

import { driver } from "@shared/drivers/DriverFactory";
import eventStackSvc from "@src/shared/services/EventStackService";

import TerrainMode from "./modes/TerrainMode";
import EntityMode from "./modes/EntityMode";
import CollisionMode from "./modes/CollisionMode";

import editorStore, { IEditorStoreState } from "./editorStore";

interface EditorStateOptions {
  id: string;
  blueprint: Promise<ILevelBlueprint> | ILevelBlueprint;
}

class EditorState extends State<EditorStateOptions> {
  public mouse: Vector2;
  public cursor: Entity;
  public gridCursor: Entity;
  public cursors: Entity[];

  public world: World;
  public id: string;
  public grid: Grid;

  public state: IEditorStoreState;

  public modes: {
    [EditorMode.TERRAIN]: TerrainMode;
    [EditorMode.ENTITY]: EntityMode;
    [EditorMode.COLLISION]: CollisionMode;
  };

  public async init({ id, blueprint }: EditorStateOptions): Promise<void> {
    console.info("Editor initialized");

    this.id = id;

    const data = await Promise.resolve(blueprint);
    this.world = new World(await Promise.resolve(blueprint));

    this.world.addSystem(new Systems.BasicInputSystem());
    this.world.addSystem(new Systems.BasicMovementSystem());
    this.world.addSystem(new Systems.PlaceableSystem());

    this.state = editorStore.initialState;

    editorStore.subscribe((state) => (this.state = state));
    editorStore.init();

    this.mouse = new Vector2(0, 0);

    await this.world.init();

    this.modes = {
      [EditorMode.TERRAIN]: new TerrainMode(this),
      [EditorMode.ENTITY]: new EntityMode(this),
      [EditorMode.COLLISION]: new CollisionMode(this),
    };

    const room = this.world.blueprint.rooms.find((room) => room.id === this.world.blueprint.defaultRoomId);

    this.grid = new Grid(
      room.tileMapCols, //
      room.tileMapRows,
      room.tileSize,
      [0, 0, 0, 0.1]
    );
    this.grid.init();

    // show a cursor following the mouse
    this.cursors = [];

    this.gridCursor = this.createGridCursor();
    this.world.addEntity(this.gridCursor);

    this.cursor = this.createCursor();
    this.world.addEntity(this.cursor);

    // add controllable object with the arrow keys to move the camera around
    const controllableObject = this.createControllableEntity();
    this.world.addEntity(controllableObject);
    this.world.followEntity(controllableObject);
    this.world.controlEntity(controllableObject);

    // focus on player if it exists
    const playerSpawnPoint = room.spawnPoints.find((spawnpoint) => spawnpoint.type === "player");

    if (playerSpawnPoint) {
      const { x, y } = playerSpawnPoint.position;
      const position = controllableObject.getComponent(Components.Position);

      position.fromValues(x, y);
    }

    editorStore.setScale(4);
  }

  public createControllableEntity(uuid = uuidv4()): Entity {
    const entity = new Entity("controllable_object", uuid);

    entity.addComponent(new Components.Position({ x: 0, y: 0 }));
    entity.addComponent(new Components.BasicInput());

    return entity;
  }

  public createCursor(uuid = uuidv4()): Entity {
    const entity = new Entity("cursor", uuid);

    entity.addComponent(new Components.Position({ x: 0, y: 0 }));
    entity.addComponent(new Components.Sprite({ alias: "cursors", row: 0, col: 2, align: "center" }));

    return entity;
  }

  public createGridCursor(uuid = uuidv4()): Entity {
    const entity = new Entity("cursor", uuid);

    entity.addComponent(new Components.Position({ x: 0, y: 0 }));
    entity.addComponent(new Components.Sprite({ alias: "cursors", row: 0, col: 1, align: "center" }));

    return entity;
  }

  public mounted(): void {
    console.info("Editor mounted");

    this.registerEvent(GameEventTypes.UNDO_EVENT, () => {
      if (!eventStackSvc.undoStack.isEmpty) {
        const action = eventStackSvc.undoStack.pop();

        eventStackSvc.redoStack.push(action);
        action.undo();
      }
    });

    this.registerEvent(GameEventTypes.REDO_EVENT, () => {
      if (!eventStackSvc.redoStack.isEmpty) {
        const action = eventStackSvc.redoStack.pop();

        eventStackSvc.undoStack.push(action);
        action.redo();
      }
    });

    this.registerEvent(GameEventTypes.SAVE_EVENT, (e: GameEvents.SaveEvent) => {
      driver.save(e.detail.id, this.world.blueprint);
    });

    this.registerEvent(GameEventTypes.USER_JOINED_ROOM_EVENT, (e: GameEvents.UserJoinedRoomEvent) => {
      /*
      const cursor = this.createCursor(e.detail.uuid);
      this.world.addEntity(cursor);
      this.cursors.push(cursor);
      */
    });

    this.registerEvent(GameEventTypes.USER_LEFT_ROOM_EVENT, (e: GameEvents.UserLeftRoomEvent) => {});

    this.modes[EditorMode.ENTITY].mounted();
    this.modes[EditorMode.TERRAIN].mounted();

    driver.sync(this.id);

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
    const camera = this.world.camera.getComponent(Components.Camera);

    this.world.render(alpha);
    this.currentMode.render(alpha);

    this.grid.use();

    this.grid.render(this.world.projectionMatrix, camera.viewMatrix, [camera.viewMatrix[6], camera.viewMatrix[7]]);
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
