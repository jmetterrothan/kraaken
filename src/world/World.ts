import { Observable } from "rxjs";
import { v4 as uuidv4 } from "uuid";
import { mat3, vec2, vec4 } from "gl-matrix";

import { gl } from "@src/Game";

import ComponentFactory from "@src/ECS/ComponentFactory";
import { Entity, Bundle, System } from "@src/ECS";
import * as Systems from "@src/ECS/systems";
import * as Components from "@src/ECS/components";

import TileMap from "@src/world/TileMap";
import Grid from "@src/shared/Grid";

import Vector2 from "@src/shared/math/Vector2";

import { IVector2 } from "@src/shared/models/event.model";
import { IProjectBlueprint, ISpawnpoint, IEventZone, ILevelBlueprint, IWorldOptions } from "@src/shared/models/world.model";
import { TileLayer } from "@src/shared/models/tilemap.model";

import { configSvc } from "@src/shared/services/ConfigService";

import { debugSvc } from "@src/shared/services/Debug";
import { DebugFlag } from "@src/enums/DebugFlag";

class World {
  public readonly projectBlueprint: IProjectBlueprint;
  public readonly levelBlueprint: ILevelBlueprint;

  public readonly options: IWorldOptions;

  public projectionMatrix: mat3 = mat3.create();

  public hitstopRemaining = 0; // seconds
  public last = window.performance.now();

  public grid: Grid;
  public tileMap: TileMap;
  public gravity: number;
  public player: Entity;
  public aimEntity: Entity;
  public controlledEntity: Entity | null;

  // TODO: improve efficiency
  private _bundles: Map<string, Bundle> = new Map();
  private _entities: Entity[] = [];
  private _systems: System[] = [];

  private renderer: System;

  private _cameras: Entity[] = [];
  private _activeCameraIndex = 0;

  constructor(levelId: string, projectBlueprint: IProjectBlueprint, _options: Partial<IWorldOptions> = {}) {
    this.projectBlueprint = projectBlueprint;

    const levelBlueprint = projectBlueprint.levels.find((level) => level.id === levelId);
    if (!levelBlueprint) {
      throw new Error(`Could not find level "${levelId}" blueprint`);
    }

    this.levelBlueprint = levelBlueprint;
  }

  public async init(): Promise<void> {
    this.addSystem(new Systems.CameraSystem());
    this.addSystem(new Systems.AnimationSystem());

    this.renderer = new Systems.RenderingSystem();
    this.renderer.addedToWorld(this);

    this.tileMap = new TileMap(this.levelBlueprint);
    this.tileMap.init();

    this.grid = new Grid(
      this.levelBlueprint.tileMapCols, //
      this.levelBlueprint.tileMapRows,
      this.levelBlueprint.tileSize,
      [0.05, 0.05, 0.05, 0],
      [0.6, 0.4, 1, 1]
    );
    this.grid.init();

    this.gravity = this.levelBlueprint.gravity;

    this.levelBlueprint.spawnPoints.forEach(this.spawn.bind(this));
    this.levelBlueprint.zones.forEach(this.createZone.bind(this));

    this.setClearColor(this.levelBlueprint.background);

    console.debug(`Project "${this.projectBlueprint.id}" world level "${this.levelBlueprint.id}" initialized`);
  }

  public playEffectOnceAt(type: string, position: IVector2, direction: IVector2 = { x: 1, y: 1 }): void {
    const effect = this.createEntity(type, { position, direction });

    const animator = effect.getComponent(Components.Animator);

    if (animator) {
      animator.animation.reset();

      effect.addComponent(new Components.Fuse({ delay: animator.animation.duration, expireAction: "despawn" }));
    }

    this.addEntity(effect);
  }

  public despawn(uuid: string): void {
    const entity = this._entities.find((temp) => temp.uuid === uuid);
    if (entity) {
      this.removeEntity(entity);
    }
  }

  public createCrosshair(uuid = uuidv4()): Entity {
    const entity = new Entity("cursor", uuid);

    entity.addComponent(new Components.Position({ x: 0, y: 0 }));
    entity.addComponent(new Components.Sprite({ alias: "cursors", row: 2, col: 4, align: "center" }));

    this.addEntity(entity);

    return entity;
  }

  public createEntity(type: string, customMetadata: any = {}, uuid?: string): Entity {
    const entity = new Entity(type, uuid);

    const components = this.projectBlueprint.entities.find((item) => item.type === type)?.components ?? [];

    components.forEach(({ name, metadata = {} }) => {
      entity.addComponent(ComponentFactory.create(name, { ...metadata, ...customMetadata[name] }));
    });

    if (entity.hasComponent(Components.PlayerInput.COMPONENT_TYPE)) {
      this.player = entity;
    }

    return entity;
  }

  public spawn({ type, uuid = uuidv4(), components = {} }: Partial<Omit<ISpawnpoint, "type">> & Pick<ISpawnpoint, "type">): Entity {
    const entity = this.createEntity(type, components, uuid);

    this.addEntity(entity);

    return entity;
  }

  public createZone({ position, width, height, color, debug = false, ...rest }: IEventZone): void {
    const zone = new Entity("event_zone");

    zone.addComponent(new Components.Position({ x: position.x, y: position.y }));
    zone.addComponent(new Components.BoundingBox({ width, height, color, debug }));
    zone.addComponent(new Components.EventZone(rest));

    this.addEntity(zone);
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
    for (let i = this._systems.length - 1; i >= 0; i--) {
      this.removeSystem(this._systems[i]);
    }
    return this;
  }

  public createBundleIfNotExists(componentTypes: ReadonlyArray<string>): string {
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

  public getEntityByUuid(uuid: string | null | undefined): Entity | undefined {
    if (typeof uuid !== "string") {
      return;
    }
    return this._entities.find((entity) => entity.uuid === uuid);
  }

  public getEntities(componentTypes: ReadonlyArray<string>): ReadonlyArray<Entity> {
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

  public entityAdded$(componentTypes: ReadonlyArray<string>): Observable<Entity> {
    const bundleId = this.createBundleIfNotExists(componentTypes);

    const bundle = this._bundles.get(bundleId);
    if (typeof bundle !== "undefined") {
      return bundle.entityAdded$;
    }

    throw Error(`Unable to perform add event on components: ${componentTypes.join(", ")}`);
  }

  public entityRemoved$(componentTypes: ReadonlyArray<string>): Observable<Entity> {
    const bundleId = this.createBundleIfNotExists(componentTypes);

    const bundle = this._bundles.get(bundleId);
    if (typeof bundle !== "undefined") {
      return bundle.entityRemoved$;
    }

    throw Error(`Unable to perform remove event on components: ${componentTypes.join(", ")}`);
  }

  public setClearColor(color: vec4): void {
    gl.clearColor(color[0], color[1], color[2], color[3]);
  }

  public update(delta: number): void {
    if (!this.tileMap) return;

    const now = window.performance.now();

    const dt = (now - this.last) / 1000; // seconds
    this.last = now;

    if (this.hitstopRemaining > 0) {
      this.hitstopRemaining = Math.max(0, this.hitstopRemaining - dt);

      return;
    }

    mat3.projection(this.projectionMatrix, configSvc.frameSize.w, configSvc.frameSize.h);

    this.tileMap.update(this, delta);

    for (let i = 0, n = this._systems.length; i < n; i++) {
      this._systems[i].execute(delta);
    }

    if (this.player && this.aimEntity) {
      const aimPosition = this.aimEntity.getComponent(Components.Position);
      const playerPosition = this.player.getComponent(Components.Position);
      const playerInput = this.player.getComponent(Components.PlayerInput);

      aimPosition.fromValues(playerPosition.x + playerInput.aim.x, playerPosition.y + playerInput.aim.y);
    }
  }

  public render(alpha: number): void {
    if (!this.tileMap) return;

    const camera = this.camera.getComponent(Components.Camera);

    this.tileMap.renderLayer(TileLayer.L1, this.projectionMatrix, camera.viewMatrix, alpha);

    this.renderer.execute(alpha);

    this.tileMap.renderLayer(TileLayer.L2, this.projectionMatrix, camera.viewMatrix, alpha);

    if (debugSvc.enabled(DebugFlag.COLLISION)) {
      this.tileMap.renderCollisionLayer(this.projectionMatrix, camera.viewMatrix, alpha);

      this.tileMap.renderDebugLayer(this.projectionMatrix, camera.viewMatrix, alpha);
    }

    if (debugSvc.enabled(DebugFlag.CAMERA)) {
      camera.renderDebug(this.projectionMatrix, camera.viewMatrix, alpha);
    }

    if (debugSvc.enabled(DebugFlag.GRID)) {
      this.grid.use();
      this.grid.render(this.projectionMatrix, camera.viewMatrix, [camera.viewMatrix[6], camera.viewMatrix[7]]);
    }
  }

  public hitstop(ms: number): void {
    const s = Math.max(0, ms) / 1000;
    this.hitstopRemaining = Math.max(this.hitstopRemaining, s); // stack by max
  }

  public handleKeyboardInput(e: KeyboardEvent, active: boolean): void {
    for (let i = 0, n = this._systems.length; i < n; i++) {
      this._systems[i].handleKeyboardInput(e, active);
    }
  }

  public handleMouseInput(e: MouseEvent, active: boolean, position: vec2): void {
    const coords = this.screenToCameraCoords(position);

    for (let i = 0, n = this._systems.length; i < n; i++) {
      this._systems[i].handleMouseInput(e, active, coords);
    }
  }

  public handleMouseMove(e: MouseEvent, position: vec2): void {
    const coords = this.screenToCameraCoords(position);

    for (let i = 0, n = this._systems.length; i < n; i++) {
      this._systems[i].handleMouseMove(e, coords);
    }
  }

  public handleFullscreenChange(_b: boolean): void {
    // ...
  }

  public handleResize(): void {
    this.recenterCamera(this.camera);
  }

  public controlEntity(entity: Entity | null): void {
    this.controlledEntity = entity;
  }

  public followEntity(entity: Entity, camera: Entity = this.camera): void {
    const state = camera.getComponent(Components.Camera);
    state.follow(entity);

    this.recenterCamera(camera);
  }

  public recenterCamera(camera: Entity): void {
    const state = camera.getComponent(Components.Camera);

    if (state.target) {
      const position = camera.getComponent(Components.Position);
      const targetPos = state.target.getComponent(Components.Position);

      if (targetPos) {
        position.copy(targetPos);
        state.shouldUpdateProjectionMatrix = true;
      }
    }
  }

  public screenToCameraCoords(coords: vec2): Vector2 {
    const camera = this.camera.getComponent(Components.Camera);

    const v = vec2.transformMat3(vec2.create(), coords, camera.viewMatrixInverse);
    return Vector2.fromGlArray(v);
  }

  public isFrustumCulled(entity: Entity): boolean {
    const camera = this.camera.getComponent(Components.Camera);
    const entityPos = entity.getComponent(Components.Position);

    if (entity.hasComponent(Components.BoundingBox.COMPONENT_TYPE)) {
      const entityBbox = entity.getComponent(Components.BoundingBox);
      // update bbox position to match the entity's position
      entityBbox.setPositionFromVector2(entityPos);

      return !camera.viewBox.intersectBox(entityBbox);
    }

    return !camera.viewBox.containsPointWithVector2(entityPos);
  }

  public addCamera(camera: Entity, defineAsActive = false): void {
    if (!camera.hasComponent(Components.Camera.COMPONENT_TYPE)) {
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

  public destroy(): void {
    this.removeAllEntities();
    this.removeAllSystems();

    if (this.renderer) {
      this.renderer.removedFromWorld(this);
    }

    this.grid.dispose();

    this._bundles.clear();

    this._cameras = [];

    this._activeCameraIndex = 0;
  }
}

export default World;
