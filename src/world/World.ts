import { Observable } from "rxjs";
import { mat3, vec2 } from "gl-matrix";

import { gl } from "@src/Game";

import Entity from "@src/ECS/Entity";
import System from "@src/ECS/System";
import Bundle from "@src/ECS/Bundle";
import ComponentFactory from "@src/ECS/ComponentFactory";

import * as Systems from "@src/ECS/systems";
import * as Components from "@src/ECS/components";
import * as ComponentTypes from "@src/ECS/types";

import SpriteManager from "@src/animation/SpriteManager";
import SoundManager from "@src/animation/SoundManager";

import TileMap from "@src/world/TileMap";

import Vector2 from "@shared/math/Vector2";

import { IVector2 } from "@shared/models/event.model";
import { IRGBAColorData } from "@shared/models/color.model";
import { IWorldBlueprint, ISpawnpoint } from "@shared/models/world.model";

import { configSvc } from "@shared/services/ConfigService";

class World {
  public readonly blueprint: IWorldBlueprint;

  public projectionMatrix: mat3 = mat3.create();

  public tileMap: TileMap;
  public gravity: number;
  public player: Entity;
  public aimEntity: Entity;
  public controlledEntity: Entity;

  private _bundles: Map<string, Bundle> = new Map();
  // TODO: improve efficiency
  private _entities: Entity[] = [];
  private _systems: System[] = [];

  private renderer: System;

  private _cameras: Entity[] = [];
  private _activeCameraIndex = 0;

  constructor(blueprint: IWorldBlueprint) {
    this.blueprint = blueprint;
  }

  public async init(): Promise<void> {
    const { sounds, sprites, level } = this.blueprint;

    for (const sound of sounds) {
      SoundManager.register(sound.src, sound.name);
    }

    for (const sprite of sprites) {
      await SpriteManager.create(sprite.src, sprite.name, sprite.tileWidth, sprite.tileHeight);
    }

    this.addSystem(new Systems.PlayerInputSystem());
    this.addSystem(new Systems.BasicInputSystem());
    this.addSystem(new Systems.BasicMovementSystem());
    this.addSystem(new Systems.PlayerMovementSystem());
    this.addSystem(new Systems.PhysicsSystem());
    this.addSystem(new Systems.CameraSystem());
    this.addSystem(new Systems.AnimationSystem());
    this.addSystem(new Systems.ConsummableSystem());
    this.addSystem(new Systems.PlayerCombatSystem());

    this.renderer = new Systems.RenderingSystem();
    this.renderer.addedToWorld(this);

    this.tileMap = new TileMap(this.blueprint);
    this.tileMap.init();
    
    this.gravity = level.gravity;
  
    this.setClearColor(level.background);

    level.spawnPoints.forEach(this.spawn.bind(this));

    const cameraComponent = new Components.Camera({ mode: 1 });
    cameraComponent.boundaries = this.tileMap.getBoundaries();

    const camera = new Entity("camera").addComponent(new Components.Position()).addComponent(cameraComponent);
    this.addCamera(camera, true);

    console.info("World initialized");
  }

  public playEffectOnceAt(type: string, position: IVector2, direction: IVector2 = { x: 1, y: 1 }): void {
    const effect = this.spawn({ type, position, direction });

    const animator = effect.getComponent<Components.Animator>(ComponentTypes.ANIMATOR_COMPONENT);
    animator.animation.reset();

    setTimeout(() => {
      this.removeEntity(effect);
    }, animator.animation.duration);
  }

  public despawn(uuid: string): void {
    // TODO: remove entity

    const entity = this._entities.find((temp) => temp.uuid === uuid);
    if (entity) {
      this.removeEntity(entity);
    }
  }

  public createEntity(type: string, uuid?: string): Entity {
    const entity = new Entity(type, uuid);

    
    this.blueprint.entities
    .find((item) => item.type === type)
    .components.forEach(({ name, metadata = {} }) => {
      entity.addComponent(ComponentFactory.create(name, metadata));
    });
    
    if (uuid === "player") {
      this.player = entity;
    }

    return entity;
  }

  public spawn({ type, uuid, position, direction }: ISpawnpoint): Entity {
    const entity = this.createEntity(type, uuid);

    if (entity.hasComponent(ComponentTypes.POSITION_COMPONENT)) {
      const positionComp = entity.getComponent<Components.Position>(ComponentTypes.POSITION_COMPONENT);
      positionComp.x = position?.x ?? 0;
      positionComp.y = position?.y ?? 0;
    }

    if (entity.hasComponent(ComponentTypes.RIGID_BODY_COMPONENT)) {
      const rigidBodyComp = entity.getComponent<Components.RigidBody>(ComponentTypes.RIGID_BODY_COMPONENT);
      rigidBodyComp.orientation.x = direction?.x ?? 1;
      rigidBodyComp.orientation.y = direction?.y ?? 1;

      rigidBodyComp.direction.x = direction?.x ?? 1;
      rigidBodyComp.direction.y = direction?.y ?? 1;
    }

    this.addEntity(entity);

    return entity;
  }

  public addSystem(system: System): World {
    this._systems.push(system);
    system.addedToWorld(this);

    return this;
  }

  public removeSystem(system: System): World {
    const index = this._systems.findIndex((temp) => temp === system);
    if (index !== -1) {
      this._systems.splice(index, 1);
      system.removedFromWorld(this);
    }
    return this;
  }

  public removeAllSystems(): World {
    for (let i = 0, n = this._systems.length; i < n; i++) {
      this.removeSystem(this._systems[i]);
    }
    return this;
  }

  public createBundleIfNotExists(componentTypes: ReadonlyArray<symbol>): string {
    const bundleId = Bundle.generateId(componentTypes);

    if (!this._bundles.has(bundleId)) {
      const bundle = new Bundle(componentTypes);

      for (let i = 0, n = this._entities.length; i < n; i++) {
        const entity = this._entities[i];

        bundle.addIfMatch(entity);
      }

      this._bundles.set(bundleId, bundle);
    }
    return bundleId;
  }

  public getEntities(componentTypes: ReadonlyArray<symbol>): ReadonlyArray<Entity> {
    const bundleId = this.createBundleIfNotExists(componentTypes);
    const bundle = this._bundles.get(bundleId);

    if (typeof bundle !== "undefined") {
      return bundle.getEntities();
    }

    throw new Error("Tried to get undefined bundle");
  }

  public addEntity(entity: Entity): World {
    this._bundles.forEach((bundle) => bundle.addIfMatch(entity));
    this._entities.push(entity);

    // listen for component added/removed and update each bundle if needed
    const { componentAdded$, componentRemoved$ } = entity;

    componentAdded$.subscribe((component) => {
      this._bundles.forEach((bundle) => bundle.onComponentAdded(entity, component));
    });

    componentRemoved$.subscribe((component) => {
      this._bundles.forEach((bundle) => bundle.onComponentRemoved(entity, component));
    });

    return this;
  }

  public removeEntity(entity: Entity): World {
    this._bundles.forEach((bundle) => bundle.remove(entity));

    const index = this._entities.findIndex((temp) => temp.uuid === entity.uuid);
    if (index !== -1) {
      this._entities.splice(index, 1);
    }
    return this;
  }

  public removeAllEntities(): World {
    for (let i = this._entities.length - 1; i >= 0; i--) {
      this.removeEntity(this._entities[i]);
    }
    return this;
  }

  public entityAdded$(componentTypes: ReadonlyArray<symbol>): Observable<Entity> {
    const bundleId = this.createBundleIfNotExists(componentTypes);

    const bundle = this._bundles.get(bundleId);
    if (typeof bundle !== "undefined") {
      return bundle.entityAdded$;
    }

    throw Error(`Unable to perform add event on components: ${componentTypes.join(", ")}`);
  }

  public entityRemoved$(componentTypes: ReadonlyArray<symbol>): Observable<Entity> {
    const bundleId = this.createBundleIfNotExists(componentTypes);

    const bundle = this._bundles.get(bundleId);
    if (typeof bundle !== "undefined") {
      return bundle.entityRemoved$;
    }

    throw Error(`Unable to perform remove event on components: ${componentTypes.join(", ")}`);
  }

  public setClearColor(color: IRGBAColorData): void {
    gl.clearColor(color.r / 255, color.g / 255, color.b / 255, color.a / 255);
  }

  public update(delta: number): void {
    mat3.projection(this.projectionMatrix, configSvc.frameSize.w, configSvc.frameSize.h);

    this.tileMap.update(this, delta);

    for (let i = 0, n = this._systems.length; i < n; i++) {
      this._systems[i].execute(delta);
    }

    if (this.player && this.aimEntity) {
      const aimPosition = this.aimEntity.getComponent<Components.Position>(ComponentTypes.POSITION_COMPONENT);
      const playerPosition = this.player.getComponent<Components.Position>(ComponentTypes.POSITION_COMPONENT);
      const playerInput = this.player.getComponent<Components.PlayerInput>(ComponentTypes.PLAYER_INPUT_COMPONENT);

      aimPosition.fromValues(playerPosition.x + playerInput.aim.x, playerPosition.y + playerInput.aim.y);
    }
  }

  public render(alpha: number): void {
    const cameraComponent = this.camera.getComponent<Components.Camera>(ComponentTypes.CAMERA_COMPONENT);
    this.tileMap.render(this.projectionMatrix, cameraComponent.viewMatrix, alpha);
  
    this.renderer.execute(alpha);
  }

  public handleKeyboardInput(key: string, active: boolean): void {
    if (active) {
      //
    }
  }

  public handleMouseLeftBtnPressed(active: boolean, position: vec2): void {
    if (active) {
      // console.log("left click");
    }
  }

  public handleMouseMiddleBtnPressed(active: boolean, position: vec2): void {
    if (active) {
      // console.log("middle click");
      this.selectCamera((this._activeCameraIndex + 1) % this._cameras.length);
    }
  }

  public handleMouseRightBtnPressed(active: boolean, position: vec2): void {
    if (active) {
      // console.log("right click");
    }
  }

  public handleMouseMove(position: vec2): void {
    // const coords = this.screenToCameraCoords(position);
  }

  public handleFullscreenChange(b: boolean): void {
    // ...
  }

  public handleResize(): void {
    this.recenterCamera(this.camera);
  }

  public controlEntity(entity?: Entity): void {
    this.controlledEntity = entity;
  }

  public followEntity(entity: Entity, camera: Entity = this.camera): void {
    const state = camera.getComponent<Components.Camera>(ComponentTypes.CAMERA_COMPONENT);
    state.follow(entity);

    this.recenterCamera(camera);
  }

  public recenterCamera(camera: Entity): void {
    const state = camera.getComponent<Components.Camera>(ComponentTypes.CAMERA_COMPONENT);

    if (state.target) {
      const position = camera.getComponent<Components.Position>(ComponentTypes.POSITION_COMPONENT);
      const targetPos = state.target.getComponent<Components.Position>(ComponentTypes.POSITION_COMPONENT);

      if (targetPos) {
        position.copy(targetPos);
        state.shouldUpdateProjectionMatrix = true;
      }
    }
  }

  public screenToCameraCoords(coords: vec2): Vector2 {
    const camera = this.camera.getComponent<Components.Camera>(ComponentTypes.CAMERA_COMPONENT);

    const v = vec2.transformMat3(vec2.create(), coords, camera.viewMatrixInverse);
    return Vector2.create(v[0], v[1]);
  }

  public isFrustumCulled(entity: Entity): boolean {
    const camera = this.camera.getComponent<Components.Camera>(ComponentTypes.CAMERA_COMPONENT);
    const entityPos = entity.getComponent<Components.Position>(ComponentTypes.POSITION_COMPONENT);

    if (entity.hasComponent(ComponentTypes.BOUNDING_BOX_COMPONENT)) {
      const entityBbox = entity.getComponent<Components.BoundingBox>(ComponentTypes.BOUNDING_BOX_COMPONENT);
      // update bbox position to match the entity's position
      entityBbox.setPositionFromVector2(entityPos);
      
      return !camera.viewBox.intersectBox(entityBbox);
    }

    return !camera.viewBox.containsPoint(entityPos);
  }

  public addCamera(camera: Entity, defineAsActive = false): void {
    if (!camera.hasComponent(ComponentTypes.CAMERA_COMPONENT)) {
      throw new Error("Invalid camera entity");
    }

    this.addEntity(camera);
    this._cameras.push(camera);

    if (defineAsActive) {
      this._activeCameraIndex = this._cameras.length - 1;
    }
  }

  public selectCamera(index: number): void {
    if (index < 0 || index > this._cameras.length - 1) {
      throw new Error("Camera selection index out of range");
    }
    this._activeCameraIndex = index;
  }

  public get camera(): Entity {
    return this._cameras[this._activeCameraIndex];
  }
}

export default World;
