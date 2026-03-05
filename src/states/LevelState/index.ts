import React from "react";
import { vec2 } from "gl-matrix";

import * as Systems from "@src/ECS/systems";
import * as Components from "@src/ECS/components";

import State, { StateOptions } from "@src/states/State";
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
import { debugOverlay } from "@src/Game";
import mouseBindings from "@src/mouseBindings";
import gamepadBindings from "@src/gamepadBindings";
import { round } from "@src/shared/utility/MathHelpers";

export interface LevelStateOptions extends StateOptions {
  levelId: string | null;
  blueprint: Promise<IProjectBlueprint> | IProjectBlueprint;
}

let mouseBindingText = "";
let keyBindingText = "";
let gamepadBindingText = "";

class LevelState extends State<LevelStateOptions> {
  public projectBlueprint: IProjectBlueprint;
  private currentLevelId: string;

  private levels: Map<string, World> = new Map<string, World>();

  public async init({ levelId, blueprint }: LevelStateOptions): Promise<void> {
    this.projectBlueprint = await Promise.resolve(blueprint);
    this.currentLevelId = levelId ?? this.projectBlueprint.defaultLevelId;

    mouseBindingText = Object.entries(mouseBindings.level)
      .filter(([, v]) => v.length > 0)
      .map(([k, v]) => `${k} = ${v.map((vv) => vv.toString()).join("/")}`)
      .join(", ");

    keyBindingText = Object.entries(keyBindings.level)
      .filter(([, v]) => v.length > 0)
      .map(([k, v]) => `${k} = ${v.map((vv) => vv.toString()).join("/")}`)
      .join(", ");

    gamepadBindingText = Object.entries(gamepadBindings.level)
      .filter(([, v]) => v.length > 0)
      .map(([k, v]) => `${k} = ${v.map((vv) => vv.toString()).join("/")}`)
      .join(", ");

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
      world.addSystem(new Systems.CameraSystem());
      world.addSystem(new Systems.PlayerCombatSystem());
      world.addSystem(new Systems.AnimationSystem());
      world.addSystem(new Systems.ConsummableSystem());
      world.addSystem(new Systems.FlyingAISystem());
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
      world.addSystem(new Systems.RenderingSystem());

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

      world.aimEntity = world.createCrosshair();

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
      const { spawnPoint } = e.detail || {};

      // if entity already exists in the world we update its position
      const entity = this.currentLevel.getEntityByUuid(spawnPoint.uuid);

      if (entity) {
        if (entity.hasComponent(Components.Position.COMPONENT_TYPE)) {
          const position = entity.getComponent(Components.Position);
          position.fromValues(spawnPoint?.components?.position?.x ?? 0, spawnPoint?.components?.position?.y ?? 0);
        }

        if (entity.hasComponent(Components.RigidBody.COMPONENT_TYPE)) {
          const rigidBody = entity.getComponent(Components.RigidBody);
          rigidBody.direction.fromValues(spawnPoint?.components?.rigid_body?.direction?.x ?? 1, spawnPoint?.components?.rigid_body?.direction?.y ?? 1);
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

    if (this.currentLevel.player) {
      const anim = this.currentLevel.player.getComponent(Components.PlayerAnimator);
      const rb = this.currentLevel.player.getComponent(Components.RigidBody);
      const position = this.currentLevel.player.getComponent(Components.Position);
      const health = this.currentLevel.player.getComponent(Components.Health);
      const movement = this.currentLevel.player.getComponent(Components.Movement);

      const combat = this.currentLevel.player.getComponent(Components.PlayerCombat);

      if (debugSvc.enabled(DebugFlag.STATS)) {
        debugOverlay.moveTo("top_center");
        debugOverlay.line(`Project "${this.projectBlueprint.id}" | Level = "${this.currentLevelId}"`);

        const posText = `Pos XY = ${position.clone()}`;
        const dirText = `Dir = ${rb.direction}`;
        const velText = `Vel = ${Math.sign(rb.velocity.x) === 1 ? "+" : Math.sign(rb.velocity.x) === -1 ? "-" : ""}${round(Math.abs(rb.velocity.x))}, ${Math.sign(rb.velocity.y) === 1 ? "+" : Math.sign(rb.velocity.y) === -1 ? "-" : ""}${round(Math.abs(rb.velocity.y))}`;
        const velModText = `Vel Mod = ${rb.velocityModifier}`;
        const gText = `G scale = ${rb.gravityScale}`;

        debugOverlay.moveTo("top_right");
        debugOverlay.line(`${posText} | ${dirText} | ${velText} | ${velModText} | ${gText}`);

        const groundedText = `Grounded = ${rb.isGrounded}`;
        const leftWallText = `L wall = ${movement.isBlockedLeft}`;
        const rightWallText = `R wall = ${movement.isBlockedRight}`;

        debugOverlay.line(`${groundedText} | ${leftWallText} | ${rightWallText}`);

        const animText = `Animation = ${anim.currentKey}`;

        debugOverlay.line(`${animText}`);
      } else {
        debugOverlay.moveTo("top_right");
        debugOverlay.line('Press "F1" for details');
      }

      if (debugSvc.enabled(DebugFlag.HELP)) {
        debugOverlay.moveTo("bottom_left");
        debugOverlay.line(`Key bindings = [${keyBindingText}]`);
        debugOverlay.line(`Mouse bindings = [${mouseBindingText}]`);
        debugOverlay.line(`Gamepad bindings = [${gamepadBindingText}]`);
      } else {
        debugOverlay.moveTo("bottom_left");
        debugOverlay.line('Press "F7" to see controls');
      }

      const healthValueText = health.value === health.maxHealth ? `${health.value}` : `${health.value}/${health.maxHealth}`;
      const ammoValueText = combat.primaryWeapon.ammo === combat.primaryWeapon.maxAmmo ? `${combat.primaryWeapon.ammo}` : `${combat.primaryWeapon.ammo}/${combat.primaryWeapon.maxAmmo}`;
      const dashValueText = movement.maxAirDashes === movement.airDashesRemaining ? `${movement.airDashesRemaining}` : `${movement.airDashesRemaining}/${movement.maxAirDashes}`;

      const healthText = `Health = ${healthValueText}`;
      const ammoText = `Ammo = ${ammoValueText}`;
      const dashText = `Dash = ${dashValueText}`;

      debugOverlay.moveTo("bottom_right");
      debugOverlay.line(`${healthText} | ${ammoText} | ${dashText}`);
    }
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
    const worldPos = this.currentLevel.screenToWorldCoords(position);
    this.mouse = worldPos;

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
