import React from "react";
import { vec2 } from "gl-matrix";

import * as Systems from "@src/ECS/systems";
import * as Components from "@src/ECS/components";

import State from "@src/states/State";
import World from "@src/world/World";

import SoundManager from "@src/animation/SoundManager";
import SpriteManager from "@src/animation/SpriteManager";

import { IProjectBlueprint } from "@src/shared/models/world.model";

import * as GameEventTypes from "@src/shared/events/constants";
import dispatch, * as GameEvents from "@src/shared/events";

import LevelUi from "./LevelUi";

import { Entity } from "@src/ECS/Entity";

import keyBindings, { matchKeyBinding } from "@src/keyBindings";
import { debugSvc } from "@src/shared/services/Debug";
import { DebugFlag } from "@src/enums/DebugFlag";
import editorStore from "../EditorState/editorStore";

interface LevelStateOptions {
  projectId: string;
  levelId: string | null;
  blueprint: Promise<IProjectBlueprint> | IProjectBlueprint;
}

class LevelState extends State<LevelStateOptions> {
  public projectBlueprint: IProjectBlueprint;
  private currentLevelId: string;

  private levels: Map<string, World> = new Map<string, World>();

  public async init({ levelId, blueprint }: LevelStateOptions): Promise<void> {
    this.projectBlueprint = await Promise.resolve(blueprint);
    this.currentLevelId = levelId ?? this.projectBlueprint.defaultLevelId;

    for (const sound of this.projectBlueprint.assets.sounds) {
      await SoundManager.register(sound.src, sound.name);
    }

    for (const sprite of this.projectBlueprint.assets.sprites) {
      await SpriteManager.create(sprite.src, sprite.name, sprite.tileWidth, sprite.tileHeight);
    }

    await this.projectBlueprint.levels.forEach(async ({ id }) => {
      const world = new World(id, this.projectBlueprint);

      world.addSystem(new Systems.PlayerInputSystem());
      world.addSystem(new Systems.PlayerMovementSystem());
      world.addSystem(new Systems.PhysicsSystem());
      world.addSystem(new Systems.PlayerCombatSystem());
      world.addSystem(new Systems.ConsummableSystem());
      world.addSystem(new Systems.AISystem());
      world.addSystem(new Systems.EventZoneSystem());
      world.addSystem(new Systems.ExplosionSystem());
      world.addSystem(new Systems.KnockbackSystem());
      world.addSystem(new Systems.FuseSystem());
      world.addSystem(new Systems.DamageFxSystem());
      world.addSystem(new Systems.FlickerOnImmuneSystem());
      world.addSystem(new Systems.ImmunitySystem());
      world.addSystem(new Systems.LootSystem());
      world.addSystem(new Systems.RespawnSystem());
      world.addSystem(new Systems.PatrolAISystem());

      debugSvc.set(DebugFlag.ALL, false);

      await world.init();

      const cameraComponent = new Components.Camera({
        smoothing: 0.1,
        lookAheadMaxPx: 80,
        lookAheadVelToPx: 0.1,
        lookAheadSmoothing: 0.18,
        deadzoneWFrac: 0.2,
        deadzoneHFrac: 0.35,
        clampSmoothing: 0.2,
      });

      cameraComponent.boundaries = world.tileMap.getBoundaries();

      const camera = new Entity("camera").addComponent(new Components.Position()).addComponent(cameraComponent);

      world.addCamera(camera, true);

      world.followEntity(world.player);
      world.controlEntity(world.player);

      // world.aimEntity = world.createCrosshair();

      this.levels.set(id, world);
    });

    editorStore.setScale(4);

    console.info("Level initialized");
  }

  public mounted(): void {
    super.mounted();

    const root = this.createRoot();
    root.render(React.createElement(LevelUi, { projectId: this.projectBlueprint.id, levelId: this.currentLevelId }));

    this.registerEvent(GameEventTypes.CHANGE_LEVEL, (e: GameEvents.ChangeLevelEvent) => {
      const { levelId, moveTo, lookAt } = e.detail;

      if (this.projectBlueprint.levels.findIndex((level) => level.id === levelId) === -1) {
        throw new Error(`Could not find level "${levelId}"`);
      }

      // kill inputs
      const input = this.currentLevel.player.getComponent(Components.PlayerInput);

      input.down = false;
      input.up = false;
      input.left = false;
      input.right = false;
      input.jump = false;

      this.currentLevelId = levelId;

      if (moveTo) {
        const position = this.currentLevel.player.getComponent(Components.Position);
        position.fromValues(moveTo.x, moveTo.y);

        const cameraPos = this.currentLevel.camera.getComponent(Components.Position);
        cameraPos.fromValues(moveTo.x, moveTo.y);
      }

      const rigidBody = this.currentLevel.player.getComponent(Components.RigidBody);
      rigidBody.velocity.fromValues(0, 0);

      if (lookAt) {
        rigidBody.direction.fromValues(lookAt.x, lookAt.y);
        rigidBody.orientation.fromValues(lookAt.x, lookAt.y);
      }
    });

    this.registerEvent(GameEventTypes.SPAWN_EVENT, (e: GameEvents.SpawnEvent) => {
      const { spawnpoint: spawnPoint } = e.detail || {};

      // if entity already exists in the world we update its position
      const entity = this.currentLevel.getEntityByUuid(spawnPoint.uuid);
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
        this.currentLevel.spawn(spawnPoint);
      }
    });

    console.debug("Level mounted");
  }

  public unmounted(): void {
    // remove ui
    this.root.unmount();

    this.levels.forEach((level) => {
      level.destroy();
    });

    this.levels = new Map();

    // remove event listeners
    this.flushEvents();

    console.debug("Level unmounted");
  }

  public update(delta: number): void {
    this.currentLevel.update(delta);
  }

  public render(alpha: number): void {
    this.currentLevel.render(alpha);
  }

  public handleGamepadInput(): void {}

  public handleKeyboardInput(e: KeyboardEvent, active: boolean): void {
    if (matchKeyBinding(keyBindings.level.edit, e)) {
      dispatch(GameEvents.editEvent(this.projectBlueprint.id, this.currentLevelId));
    } else {
      this.currentLevel.handleKeyboardInput(e, active);
    }
  }

  public handleMouseInput(e: MouseEvent, active: boolean, position: vec2): void {
    this.currentLevel.handleMouseInput(e, active, position);
  }

  public handleMouseMove(e: MouseEvent, position: vec2): void {
    this.currentLevel.handleMouseMove(e, position);
  }

  public handleFullscreenChange(b: boolean): void {
    this.currentLevel.handleFullscreenChange(b);
  }

  public handleResize(): void {
    this.currentLevel.handleResize();
  }

  public get currentLevel(): World {
    return this.levels.get(this.currentLevelId)!;
  }
}

export default LevelState;
