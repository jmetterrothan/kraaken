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
import { IProjectBlueprint, ILevelBlueprint } from "@src/shared/models/world.model";

import Vector2 from "@src/shared/math/Vector2";

import SoundManager from "@src/animation/SoundManager";
import SpriteManager from "@src/animation/SpriteManager";

import * as GameEventTypes from "@src/shared/events/constants";

import { driver } from "@src/shared/drivers/DriverFactory";
import eventStackSvc from "@src/shared/services/EventStackService";

import dispatch, * as GameEvents from "@src/shared/events";

import TerrainMode from "./modes/TerrainMode";
import EntityMode from "./modes/EntityMode";
import CollisionMode from "./modes/CollisionMode";

import editorStore, { IEditorStoreState } from "./editorStore";

import keyBindings, { matchKeyBinding } from "@src/keyBindings";

import { Position } from "@src/ECS/components";

interface EditorStateOptions {
  projectId: string;
  blueprint: Promise<IProjectBlueprint> | IProjectBlueprint;
}

type LevelData = {
  world: World;
  cursor: Entity;
};

class EditorState extends State<EditorStateOptions> {
  public projectBlueprint: IProjectBlueprint;
  public currentLevelId: string;

  private levels: Map<string, LevelData> = new Map<string, LevelData>();

  private backupIntervalId = -1;

  public mouse: Vector2 = new Vector2();

  public state: IEditorStoreState;

  public modes: {
    [EditorMode.TERRAIN]: TerrainMode;
    [EditorMode.ENTITY]: EntityMode;
    [EditorMode.COLLISION]: CollisionMode;
  };

  public async init({ blueprint }: EditorStateOptions): Promise<void> {
    this.projectBlueprint = await Promise.resolve(blueprint);
    this.currentLevelId = this.projectBlueprint.defaultLevelId;

    for (const sound of this.projectBlueprint.assets.sounds) {
      await SoundManager.register(sound.src, sound.name);
    }

    for (const sprite of this.projectBlueprint.assets.sprites) {
      await SpriteManager.create(sprite.src, sprite.name, sprite.tileWidth, sprite.tileHeight);
    }

    await this.projectBlueprint.levels.forEach(async ({ id }) => {
      const level = this.projectBlueprint.levels.find((level) => level.id === id);

      if (!level) {
        throw new Error(`Could not find level with id = ${id}`);
      }

      await this.initLevel(level);
    });

    // await this.addLevel("3", 16, "tiles");

    this.state = editorStore.initialState;
    editorStore.subscribe((state) => {
      console.log(state);

      if (this.state.mode !== state.mode) {
        this.modes[this.state.mode].unmounted();
        this.modes[state.mode].mounted();
      }

      this.state = state;
    });
    editorStore.init();

    this.mouse = new Vector2(0, 0);

    this.modes = {
      [EditorMode.TERRAIN]: new TerrainMode(this),
      [EditorMode.ENTITY]: new EntityMode(this),
      [EditorMode.COLLISION]: new CollisionMode(this),
    };

    this.currentMode.mounted();

    editorStore.setScale(3);

    console.info("Editor initialized");
  }

  public async initLevel(level: ILevelBlueprint): Promise<void> {
    const world = new World(level.id, this.projectBlueprint, {
      showGrid: true,
      showZones: true,
    });

    world.addSystem(new Systems.BasicInputSystem());
    world.addSystem(new Systems.BasicMovementSystem());
    world.addSystem(new Systems.PlaceableSystem());

    await world.init();

    const cameraComponent = new Components.Camera({
      smoothing: 0.1,
    });

    const camera = new Entity("camera").addComponent(new Components.Position()).addComponent(cameraComponent);

    world.addCamera(camera, true);

    const cursor = this.createCursor();
    world.addEntity(cursor);

    // add controllable object with the arrow keys to move the camera around
    const controllableObject = this.createControllableEntity();
    world.addEntity(controllableObject);
    world.followEntity(controllableObject);
    world.controlEntity(controllableObject);

    // focus on player if it exists
    const playerSpawnPoint = level.spawnPoints.find((spawnpoint) => spawnpoint.type === "dino");

    if (playerSpawnPoint) {
      const { x, y } = playerSpawnPoint.position;
      const position = controllableObject.getComponent(Components.Position);

      position.fromValues(x, y);
    }

    this.levels.set(level.id, { world, cursor });
  }

  public async addLevel(id: string, tileSize: number, tileSet: string): Promise<void> {
    const level = {
      id,
      tileSize,
      tileSet,
      tileMapRows: 64,
      tileMapCols: 64,
      layers: {
        1: [],
        2: [],
        3: [],
      },
      spawnPoints: [],
      zones: [],
    };

    this.projectBlueprint.levels.push(level);

    await this.initLevel(level);

    this.currentLevelId = level.id;
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

  public mounted(): void {
    console.info("Editor mounted");

    this.backupIntervalId = window.setInterval(() => {
      driver.backup(this.projectBlueprint);
    }, 1000 * 30);

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

    this.registerEvent(GameEventTypes.SAVE_EVENT, async (_e: GameEvents.SaveEvent) => {
      try {
        editorStore.setLoading(true);
        await driver.save(this.projectBlueprint);
      } finally {
        editorStore.setLoading(false);
      }
    });

    this.registerEvent(GameEventTypes.USER_JOINED_LEVEL_EVENT, (_e: GameEvents.UserJoinedLevelEvent) => {
      /*
      const cursor = this.createCursor(e.detail.uuid);
      this.world.addEntity(cursor);
      this.cursors.push(cursor);
      */
    });

    this.registerEvent(GameEventTypes.USER_LEFT_LEVEL_EVENT, (_e: GameEvents.UserLeftLevelEvent) => {});

    driver.sync(this.projectBlueprint.id);

    // init ui
    this.root.render(
      React.createElement(LevelEditorUi, {
        projectId: this.projectBlueprint.id,
        blueprint: this.projectBlueprint,
      })
    );
  }

  public unmounted(): void {
    console.info("Editor unmounted");

    window.clearInterval(this.backupIntervalId);

    // remove event listeners
    this.flushEvents();

    // reset event history stack
    eventStackSvc.reset();

    this.levels.forEach((level) => {
      level.world.destroy();
    });

    this.levels = new Map();

    // remove ui
    this.root.unmount();
  }

  public update(delta: number): void {
    const cursorPosition = this.currentLevel.cursor.getComponent(Position);
    cursorPosition.fromValues(this.mouse.x, this.mouse.y);

    this.currentLevel.world.update(delta);
    this.currentMode.update(delta);
  }

  public render(alpha: number): void {
    this.currentLevel.world.render(alpha);
    this.currentMode.render(alpha);
  }

  public handleGamepadInput(): void {}

  public handleKeyboardInput(e: KeyboardEvent, active: boolean): void {
    this.currentLevel.world.handleKeyboardInput(e, active);

    if (active) {
      if (matchKeyBinding(keyBindings.editor.undo, e)) {
        dispatch(GameEvents.undoEvent());
      } else if (matchKeyBinding(keyBindings.editor.redo, e)) {
        dispatch(GameEvents.redoEvent());
      } else if (matchKeyBinding(keyBindings.editor.zoomOut, e)) {
        dispatch(GameEvents.zoomOutEvent());
      } else if (matchKeyBinding(keyBindings.editor.zoomIn, e)) {
        dispatch(GameEvents.zoomInEvent());
      } else if (matchKeyBinding(keyBindings.editor.save, e)) {
        dispatch(GameEvents.saveEvent(this.projectBlueprint.id));
      } else if (matchKeyBinding(keyBindings.editor.play, e)) {
        dispatch(GameEvents.playEvent(this.projectBlueprint.id));
      } else {
        this.currentMode.handleKeyboardInput(e, active);
      }
    } else {
      this.currentMode.handleKeyboardInput(e, active);
    }
  }

  public handleMouseInput(e: MouseEvent, active: boolean, position: vec2): void {
    this.currentLevel.world.handleMouseInput(e, active, position);
    this.currentMode.handleMouseInput(e, active, position);
  }

  public handleMouseMove(e: MouseEvent, position: vec2): void {
    const worldPos = this.currentLevel.world.screenToCameraCoords(position);
    this.mouse = worldPos;

    this.currentLevel.world.handleMouseMove(e, position);
    this.currentMode.handleMouseMove(e, position);
  }

  public handleFullscreenChange(b: boolean): void {
    this.currentLevel.world.handleFullscreenChange(b);
  }

  public handleResize(): void {
    this.currentLevel.world.handleResize();
  }

  public get currentMode() {
    return this.modes[this.state.mode];
  }

  public get currentLevel(): LevelData {
    return this.levels.get(this.currentLevelId)!;
  }
}

export default EditorState;
