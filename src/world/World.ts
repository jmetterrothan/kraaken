import { mat3, vec2 } from 'gl-matrix';

import Box2 from '@shared/math/Box2';
import Vector2 from '@shared/math/Vector2';
import Sprite from '@src/animation/Sprite';
import Camera from '@src/Camera';
import Entity from '@src/objects/entity/Entity';
import NPC from '@src/objects/entity/NPC';
import Player from '@src/objects/entity/Player';
import DamageEffectConsummable from '@src/objects/loot/DamageEffectConsummable';
import HealEffectConsummable from '@src/objects/loot/HealEffectConsummable';
import Object2d from '@src/objects/Object2d';
import TileMap from '@src/world/TileMap';

import { configSvc } from '@shared/services/config.service';

import { IObjectLevelData } from '@src/shared/models/entity.model';
import { IWorldData } from '@src/shared/models/world.model';

class World {
  public readonly data: IWorldData;

  protected children: Map<string, Object2d>;

  private viewMatrix: mat3;

  private camera: Camera;
  private tileMap: TileMap;
  private player: Player;

  private entities: Entity[];

  // physics
  private gravity: Vector2;

  constructor(data: IWorldData) {
    this.data = data;

    this.children = new Map<string, Object2d>();

    this.viewMatrix = mat3.create();
    this.camera = new Camera();

    this.entities = [];
  }

  public async init() {
    const { sprites, level } = this.data;

    for (const sprite of sprites) {
      await Sprite.create(sprite.src, sprite.name, sprite.tileWidth, sprite.tileHeight);
    }

    this.gravity = new Vector2(level.physics.gravity.x, level.physics.gravity.y);

    this.tileMap = new TileMap(level.tileMap);
    this.tileMap.init();

    this.initPlayer(level.player);
    this.initEntities(level.entities);
    this.initLoots(level.loots);

    console.info('World initialized');

    /*
    setInterval(() => {
      console.log(`entities : ${this.countVisibleObjects()}/${this.countAllObjects()}`);
    }, 1000);

    setInterval(() => {
      for (const [key, val] of SFX.POOL.entries()) {
        if (SFX.POOL.has(key)) {
          console.log(`${key} => ${SFX.POOL.get(key).length()}`);
        }
      }
    }, 1000);
    */
  }

  public add(object: Object2d) {
    this.children.set(object.getUUID(), object);
    this.entities = Array.from(this.children.values()).filter((child: any) => child instanceof Entity) as Entity[];
  }

  public remove(objects: Object2d | Object2d[]) {
    if (Array.isArray(objects)) {
      for (const temp of objects as Object2d[]) {
        this.remove(temp);
      }
      return;
    }

    const object = objects as Object2d;

    this.remove(object.getChildren());

    object.objectWillBeRemoved();
    this.children.delete(object.getUUID());

    this.entities = Array.from(this.children.values()).filter((child: any) => child instanceof Entity) as Entity[];
  }

  public update(delta: number) {
    mat3.projection(this.viewMatrix, configSvc.frameSize.w, configSvc.frameSize.h);

    this.children.forEach((child: Object2d) => {
      if (this.canBeCleanedUp(child)) {
        this.remove(child);
        return;
      }

      child.update(this, delta);
      child.setCulled(this.camera.isFrustumCulled(child));
    });

    this.camera.update(this, delta);
    this.tileMap.update(this, delta);
  }

  public render(alpha: number) {
    const viewProjectionMatrix = mat3.multiply(mat3.create(), this.viewMatrix, this.camera.getProjectionMatrix());

    this.tileMap.render(viewProjectionMatrix, alpha);

    this.children.forEach((child) => {
      child.render(viewProjectionMatrix, alpha);
    });

    // console.log(`entities : ${i}/${this.children.size}`);
  }

  public getActiveEntities(): Entity[] {
    return this.entities;
  }

  public countObjects(target: Object2d | Object2d[], test: any): number {
    if (Array.isArray(target)) {
      const a = target as Object2d[];
      if (a.length === 0) {
        return 0;
      }

      return a.reduce((acc, child) => acc + this.countObjects(child, test), 0);
    }

    return test(target) + this.countObjects((target as Object2d).getChildren(), test);
  }

  public countAllObjects(): number {
    return this.countObjects(
      Array.from(this.children.values()),
      (object: Object2d) => object instanceof Object2d,
    );
  }

  public countVisibleObjects(): number {
    return this.countObjects(
      Array.from(this.children.values()),
      (object: Object2d) => !object.isCulled() && object.isVisible(),
    );
  }

  public canBeCleanedUp(target: Object2d | Object2d[]): boolean {
    // clean only if all children are dirty too
    if (Array.isArray(target)) {
      const a = target as Object2d[];
      if (a.length === 0) {
        return true;
      }

      return a.reduce((acc, child) => acc && this.canBeCleanedUp(child), true);
    }

    const object = target as Object2d;
    if (!object.isDirty()) {
      return false;
    }

    return this.canBeCleanedUp(object.getChildren());
  }

  public handleKeyboardInput(key: string, active: boolean) {
    this.player.handleKeyboardInput(key, active);
  }

  public handleMousePressed(button: number, active: boolean, position: vec2) {
    /*
    const choices = ['cherry', 'gemstone'];

    if (active && button === 0) {
      const coords = this.camera.screenToCameraCoords(position);
      const className = Math.random() >= 0.5 ? HealEffectConsummable : DamageEffectConsummable;
      const entity = new className(
          coords[0], coords[1],
          new Vector2(1, 1),
          this.data.entities[choices[getRandomInt(0, choices.length)]],
        );

      this.add(entity);
    }
    */
  }

  public handleMouseMove(position: vec2) {

  }

  public handleFullscreenChange(b: boolean) {

  }

  public handleResize() {
    this.camera.recenter();
  }

  public getPlayer(): Player { return this.player; }
  public getCamera(): Camera { return this.camera; }
  public getTileMap(): TileMap { return this.tileMap; }
  public getBoundaries(): Box2 { return this.tileMap.getBoundaries(); }
  public getGravity(): Vector2 { return this.gravity; }

  private initPlayer({ ref, spawn, direction, debug }: IObjectLevelData) {
    this.player = new Player(spawn.x, spawn.y, new Vector2(direction.x, direction.y), this.data.entities[ref]);

    if (debug) {
      this.player.showDebug();
    }
    this.add(this.player);

    this.camera.follow(this.player);
  }

  private initEntities(entities: IObjectLevelData[]) {
    for (const entityLevelData of entities) {
      const { ref, spawn, direction, debug } = entityLevelData;
      const npc = new NPC(spawn.x, spawn.y, new Vector2(direction.x, direction.y), this.data.entities[ref]);

      if (debug) {
        npc.showDebug();
      }
      this.add(npc);
    }
  }

  private initLoots(loots: IObjectLevelData[]) {
    for (const lootLevelData of loots) {
      const { ref, spawn, direction, debug } = lootLevelData;
      const lootData = this.data.loots[ref];

      const loot = new DamageEffectConsummable(spawn.x, spawn.y, new Vector2(direction.x, direction.y), this.data.entities[lootData.ref], lootData.metadata);

      if (debug) {
        loot.showDebug();
      }
      this.add(loot);
    }
  }
}

export default World;
