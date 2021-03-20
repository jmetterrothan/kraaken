import React from "react";
import ReactDOM from "react-dom";
import { vec2 } from "gl-matrix";

import * as Systems from "@src/ECS/systems";
import * as Components from "@src/ECS/components";

import State from "@src/states/State";
import World from "@src/world/World";

import SoundManager from "@src/animation/SoundManager";
import SpriteManager from "@src/animation/SpriteManager";

import { ILevelBlueprint } from "@shared/models/world.model";

import * as GameEventTypes from "@shared/events/constants";
import * as GameEvents from "@shared/events";

import editorStore from "../EditorState/editorStore";

import LevelUi from "./LevelUi";

interface LevelStateOptions {
  blueprint: Promise<ILevelBlueprint> | ILevelBlueprint;
}

class LevelState extends State<LevelStateOptions> {
  public levelBlueprint: ILevelBlueprint;
  private currentRoomId: string;

  private rooms: Map<string, World> = new Map<string, World>();

  public async init({ blueprint }: LevelStateOptions): Promise<void> {
    this.levelBlueprint = await Promise.resolve(blueprint);
    this.currentRoomId = this.levelBlueprint.defaultRoomId;

    for (const sound of this.levelBlueprint.resources.sounds) {
      await SoundManager.register(sound.src, sound.name);
    }

    for (const sprite of this.levelBlueprint.resources.sprites) {
      await SpriteManager.create(sprite.src, sprite.name, sprite.tileWidth, sprite.tileHeight);
    }

    await this.levelBlueprint.rooms.forEach(async ({ id }) => {
      const world = new World(id, this.levelBlueprint);

      world.addSystem(new Systems.PlayerInputSystem());
      world.addSystem(new Systems.MovementSystem());
      world.addSystem(new Systems.PhysicsSystem());
      world.addSystem(new Systems.PlayerCombatSystem());
      world.addSystem(new Systems.ConsummableSystem());
      world.addSystem(new Systems.AISystem());
      world.addSystem(new Systems.FlickerOnImmuneSystem());
      world.addSystem(new Systems.EventZoneSystem());

      await world.init();

      world.followEntity(world.player);
      world.controlEntity(world.player);

      world.aimEntity = world.createCrosshair();

      this.rooms.set(id, world);
    });

    editorStore.setScale(6);

    console.info("Level initialized");
  }

  public mounted(): void {
    console.info("Level mounted");

    this.registerEvent(GameEventTypes.CHANGE_ROOM, (e: GameEvents.ChangeRoomEvent) => {
      const { roomId, moveTo, lookAt } = e.detail;

      if (this.levelBlueprint.rooms.findIndex((room) => room.id === roomId) === -1) {
        throw new Error(`Could not find room "${roomId}"`);
      }

      this.currentRoomId = roomId;

      if (moveTo) {
        const position = this.currentRoom.player.getComponent(Components.Position);
        position.fromValues(moveTo.x, moveTo.y);

        const cameraPos = this.currentRoom.camera.getComponent(Components.Position);
        cameraPos.fromValues(moveTo.x, moveTo.y);
      }

      const rigidBody = this.currentRoom.player.getComponent(Components.RigidBody);
      rigidBody.velocity.fromValues(0, 0);

      if (lookAt) {
        rigidBody.direction.fromValues(lookAt.x, lookAt.y);
        rigidBody.orientation.fromValues(lookAt.x, lookAt.y);
      }
    });

    this.registerEvent(GameEventTypes.SPAWN_EVENT, (e: GameEvents.SpawnEvent) => {
      const { spawnpoint: spawnPoint } = e.detail || {};

      // if entity already exists in the world we update its position
      const entity = this.currentRoom.getEntityByUuid(spawnPoint.uuid);
      if (entity) {
        if (entity.hasComponent(Components.Position.COMPONENT_TYPE)) {
          const position = entity.getComponent(Components.Position);
          position.fromValues(spawnPoint.position.x, spawnPoint.position.y);
        }

        if (entity.hasComponent(Components.RigidBody.COMPONENT_TYPE)) {
          const rigidBody = entity.getComponent(Components.RigidBody);
          rigidBody.direction.fromValues(spawnPoint.direction.x || 1, spawnPoint.direction.y || 1);
        }
      } else {
        this.currentRoom.spawn(spawnPoint);
      }
    });

    ReactDOM.render(React.createElement(LevelUi, { levelId: this.levelBlueprint.id }), this.$ui);
  }

  public unmounted(): void {
    console.info("Level unmounted");

    // remove ui
    ReactDOM.unmountComponentAtNode(this.$ui);

    // remove event listeners
    this.flushEvents();
  }

  public update(delta: number): void {
    this.currentRoom.update(delta);
  }

  public render(alpha: number): void {
    this.currentRoom.render(alpha);
  }

  public handleKeyboardInput(key: string, active: boolean): void {
    this.currentRoom.handleKeyboardInput(key, active);
  }

  public handleMouseLeftBtnPressed(active: boolean, position: vec2): void {
    this.currentRoom.handleMouseLeftBtnPressed(active, position);
  }

  public handleMouseMiddleBtnPressed(active: boolean, position: vec2): void {
    this.currentRoom.handleMouseMiddleBtnPressed(active, position);
  }

  public handleMouseRightBtnPressed(active: boolean, position: vec2): void {
    this.currentRoom.handleMouseRightBtnPressed(active, position);
  }

  public handleMouseMove(position: vec2): void {
    this.currentRoom.handleMouseMove(position);
  }

  public handleFullscreenChange(b: boolean): void {
    this.currentRoom.handleFullscreenChange(b);
  }

  public handleResize(): void {
    this.currentRoom.handleResize();
  }

  public get currentRoom(): World {
    return this.rooms.get(this.currentRoomId);
  }
}

export default LevelState;
