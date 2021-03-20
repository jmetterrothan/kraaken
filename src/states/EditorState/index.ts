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

import LevelEditorUi from "@src/states/EditorState/LevelEditorUi";

import { EditorMode } from "@shared/models/editor.model";
import { ILevelBlueprint } from "@shared/models/world.model";

import Vector2 from "@shared/math/Vector2";

import SoundManager from "@src/animation/SoundManager";
import SpriteManager from "@src/animation/SpriteManager";

import * as GameEventTypes from "@src/shared/events/constants";

import { driver } from "@shared/drivers/DriverFactory";
import eventStackSvc from "@shared/services/EventStackService";

import * as GameEvents from "@shared/events";

import TerrainMode from "./modes/TerrainMode";
import EntityMode from "./modes/EntityMode";
import CollisionMode from "./modes/CollisionMode";

import editorStore, { IEditorStoreState } from "./editorStore";

interface EditorStateOptions {
  levelId: string;
  blueprint: Promise<ILevelBlueprint> | ILevelBlueprint;
}

class EditorState extends State<EditorStateOptions> {
  public levelBlueprint: ILevelBlueprint;
  public currentRoomId: string;

  private rooms: Map<string, World> = new Map<string, World>();

  public mouse: Vector2;
  public cursor: Entity;
  public gridCursor: Entity;
  public cursors: Entity[];

  public state: IEditorStoreState;

  public modes: {
    [EditorMode.TERRAIN]: TerrainMode;
    [EditorMode.ENTITY]: EntityMode;
    [EditorMode.COLLISION]: CollisionMode;
  };

  public async init({ blueprint }: EditorStateOptions): Promise<void> {
    this.levelBlueprint = await Promise.resolve(blueprint);
    this.currentRoomId = this.levelBlueprint.defaultRoomId;

    for (const sound of this.levelBlueprint.resources.sounds) {
      await SoundManager.register(sound.src, sound.name);
    }

    for (const sprite of this.levelBlueprint.resources.sprites) {
      await SpriteManager.create(sprite.src, sprite.name, sprite.tileWidth, sprite.tileHeight);
    }

    await this.levelBlueprint.rooms.forEach(async ({ id }) => {
      const room = this.levelBlueprint.rooms.find((room) => room.id === id);

      const world = new World(id, this.levelBlueprint, {
        showGrid: true,
        showZones: true,
      });

      world.addSystem(new Systems.BasicInputSystem());
      world.addSystem(new Systems.BasicMovementSystem());
      world.addSystem(new Systems.PlaceableSystem());

      await world.init();

      // show a cursor following the mouse
      this.cursors = [];

      this.gridCursor = this.createGridCursor();
      world.addEntity(this.gridCursor);

      this.cursor = this.createCursor();
      world.addEntity(this.cursor);

      // add controllable object with the arrow keys to move the camera around
      const controllableObject = this.createControllableEntity();
      world.addEntity(controllableObject);
      world.followEntity(controllableObject);
      world.controlEntity(controllableObject);

      // focus on player if it exists
      const playerSpawnPoint = room.spawnPoints.find((spawnpoint) => spawnpoint.type === "player");

      if (playerSpawnPoint) {
        const { x, y } = playerSpawnPoint.position;
        const position = controllableObject.getComponent(Components.Position);

        position.fromValues(x, y);
      }

      this.rooms.set(id, world);
    });

    this.state = editorStore.initialState;
    editorStore.subscribe((state) => (this.state = state));
    editorStore.init();

    this.mouse = new Vector2(0, 0);

    this.modes = {
      [EditorMode.TERRAIN]: new TerrainMode(this),
      [EditorMode.ENTITY]: new EntityMode(this),
      [EditorMode.COLLISION]: new CollisionMode(this),
    };

    editorStore.setScale(4);

    console.info("Editor initialized");
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
      driver.save(e.detail.id, this.levelBlueprint);
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

    driver.sync(this.levelBlueprint.id);

    // init ui
    ReactDOM.render(
      React.createElement(LevelEditorUi, {
        levelId: this.levelBlueprint.id,
        blueprint: this.levelBlueprint,
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
    this.currentRoom.update(delta);
    this.currentMode.update(delta);
  }

  public render(alpha: number): void {
    this.currentRoom.render(alpha);
    this.currentMode.render(alpha);
  }

  public handleKeyboardInput(key: string, active: boolean): void {
    this.currentRoom.handleKeyboardInput(key, active);
    this.currentMode.handleKeyboardInput(key, active);
  }

  public handleMouseLeftBtnPressed(active: boolean, position: vec2): void {
    this.currentRoom.handleMouseLeftBtnPressed(active, position);
    this.currentMode.handleMouseLeftBtnPressed(active, position);
  }

  public handleMouseMiddleBtnPressed(active: boolean, position: vec2): void {
    this.currentRoom.handleMouseMiddleBtnPressed(active, position);
    this.currentMode.handleMouseMiddleBtnPressed(active, position);
  }

  public handleMouseRightBtnPressed(active: boolean, position: vec2): void {
    this.currentRoom.handleMouseRightBtnPressed(active, position);
    this.currentMode.handleMouseRightBtnPressed(active, position);
  }

  public handleMouseMove(position: vec2): void {
    this.mouse = this.currentRoom.screenToCameraCoords(position);

    this.currentRoom.handleMouseMove(position);
    this.currentMode.handleMouseMove(position);
  }

  public handleFullscreenChange(b: boolean): void {
    this.currentRoom.handleFullscreenChange(b);
  }

  public handleResize(): void {
    this.currentRoom.handleResize();
  }

  public get currentMode(): any {
    return this.modes[this.state.mode];
  }

  public get currentRoom(): World {
    return this.rooms.get(this.currentRoomId);
  }
}

export default EditorState;
