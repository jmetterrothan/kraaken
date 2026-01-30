import React from "react";
import { vec2 } from "gl-matrix";
import { v4 as uuidv4 } from "uuid";

import { Entity } from "@src/ECS";
import * as Components from "@src/ECS/components";
import * as Systems from "@src/ECS/systems";

import State from "@src/states/State";
import World from "@src/world/World";

import LevelEditorUi from "@src/states/EditorState/LevelEditorUi";

import { EditorMode } from "@src/shared/models/editor.model";
import { ILevelBlueprint } from "@src/shared/models/world.model";

import Vector2 from "@src/shared/math/Vector2";

import SoundManager from "@src/animation/SoundManager";
import SpriteManager from "@src/animation/SpriteManager";

import * as GameEventTypes from "@src/shared/events/constants";

import { driver } from "@src/shared/drivers/DriverFactory";
import eventStackSvc from "@src/shared/services/EventStackService";

import * as GameEvents from "@src/shared/events";

import TerrainMode from "./modes/TerrainMode";
import EntityMode from "./modes/EntityMode";
import CollisionMode from "./modes/CollisionMode";

import editorStore, { IEditorStoreState } from "./editorStore";
import MouseButton from "@src/enums/MouseButton";

interface EditorStateOptions {
  levelId: string;
  blueprint: Promise<ILevelBlueprint> | ILevelBlueprint;
}

type RoomData = {
  world: World;
  cursor: Entity;
  gridCursor: Entity;
};

class EditorState extends State<EditorStateOptions> {
  public levelBlueprint: ILevelBlueprint;
  public currentRoomId: string = "";

  private rooms: Map<string, RoomData> = new Map<string, RoomData>();

  public mouse: Vector2 = new Vector2();

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

      if (!room) {
        throw new Error(`Could not find room with id = ${id}`);
      }

      const world = new World(id, this.levelBlueprint, {
        showGrid: true,
        showZones: true,
      });

      world.addSystem(new Systems.BasicInputSystem());
      world.addSystem(new Systems.BasicMovementSystem());
      world.addSystem(new Systems.PlaceableSystem());

      await world.init();

      // show a cursor following the mouse
      const gridCursor = this.createGridCursor();
      world.addEntity(gridCursor);

      const cursor = this.createCursor();
      world.addEntity(cursor);

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

      this.rooms.set(id, { world, gridCursor, cursor });
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

    editorStore.setScale(3);

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

        if (action) {
          eventStackSvc.redoStack.push(action);
          action.undo();
        }
      }
    });

    this.registerEvent(GameEventTypes.REDO_EVENT, () => {
      if (!eventStackSvc.redoStack.isEmpty) {
        const action = eventStackSvc.redoStack.pop();

        if (action) {
          eventStackSvc.undoStack.push(action);
          action.redo();
        }
      }
    });

    this.registerEvent(GameEventTypes.SAVE_EVENT, (e: GameEvents.SaveEvent) => {
      driver.save(e.detail.id, this.levelBlueprint);
    });

    this.registerEvent(GameEventTypes.USER_JOINED_ROOM_EVENT, (_e: GameEvents.UserJoinedRoomEvent) => {
      /*
      const cursor = this.createCursor(e.detail.uuid);
      this.world.addEntity(cursor);
      this.cursors.push(cursor);
      */
    });

    this.registerEvent(GameEventTypes.USER_LEFT_ROOM_EVENT, (_e: GameEvents.UserLeftRoomEvent) => {});

    this.modes[EditorMode.ENTITY].mounted();
    this.modes[EditorMode.TERRAIN].mounted();

    driver.sync(this.levelBlueprint.id);

    // init ui
    this.root.render(
      React.createElement(LevelEditorUi, {
        levelId: this.levelBlueprint.id,
        blueprint: this.levelBlueprint,
      })
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

    this.rooms.forEach((room) => {
      room.world.destroy();
    });

    this.rooms = new Map();

    // remove ui
    this.root.unmount();
  }

  public update(delta: number): void {
    this.currentRoom.world.update(delta);
    this.currentMode.update(delta);
  }

  public render(alpha: number): void {
    this.currentRoom.world.render(alpha);
    this.currentMode.render(alpha);
  }

  public handleGamepadInput(): void {}

  public handleKeyboardInput(key: string, active: boolean): void {
    this.currentRoom.world.handleKeyboardInput(key, active);
    this.currentMode.handleKeyboardInput(key, active);
  }

  public handleMouseInput(button: MouseButton, shiftKey: boolean, ctrlKey: boolean, active: boolean, position: vec2): void {
    this.currentRoom.world.handleMouseInput(button, shiftKey, ctrlKey, active, position);
    this.currentMode.handleMouseInput(button, shiftKey, ctrlKey, active, position);
  }

  public handleMouseMove(position: vec2): void {
    this.mouse = this.currentRoom.world.screenToCameraCoords(position);

    this.currentRoom.world.handleMouseMove(position);
    this.currentMode.handleMouseMove(position);
  }

  public handleFullscreenChange(b: boolean): void {
    this.currentRoom.world.handleFullscreenChange(b);
  }

  public handleResize(): void {
    this.currentRoom.world.handleResize();
  }

  public get currentMode(): any {
    return this.modes[this.state.mode];
  }

  public get currentRoom(): RoomData {
    return this.rooms.get(this.currentRoomId)!;
  }
}

export default EditorState;
