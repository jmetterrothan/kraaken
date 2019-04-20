import { mat3, vec2 } from 'gl-matrix';

import Box2 from '@shared/math/Box2';
import Sprite from '@src/animation/Sprite';
import Camera from '@src/Camera';
import Entity from '@src/objects/entity/Entity';
import Player from '@src/objects/entity/Player';
import HealEffectConsummable from '@src/objects/loot/HealEffectConsummable';
import Object2d from '@src/objects/Object2d';
import TileMap from '@src/world/TileMap';

import { configSvc } from '@shared/services/config.service';

import { IWorldData } from '@src/shared/models/world.model';
import { getRandomInt } from '@src/shared/utility/MathHelpers';

class World {
  protected children: Map<string, Object2d>;
  private data: IWorldData;

  private viewMatrix: mat3;

  private camera: Camera;
  private tileMap: TileMap;
  private player: Player;

  constructor(data: IWorldData) {
    this.data = data;

    this.children = new Map<string, Object2d>();

    this.viewMatrix = mat3.create();
    this.camera = new Camera();

    this.tileMap = new TileMap(data.level.cols, data.level.rows, data.level.tileSize);
  }

  public async init() {
    for (const sprite of this.data.sprites) {
      await Sprite.create(sprite.src, sprite.name, sprite.tileWidth, sprite.tileHeight);
    }

    this.add(this.tileMap.getBoundaries().createHelper());

    this.player = new Player(this.data.level.player.spawn.x, this.data.level.player.spawn.y, this.data.entities[this.data.level.player.key]);
    this.camera.follow(this.player);

    this.add(this.player);
    this.add(this.camera);

    for (const entityData of this.data.level.entities) {
      this.add(new Entity(entityData.spawn.x, entityData.spawn.y, this.data.entities[entityData.key]));
    }

    this.add(new HealEffectConsummable(512 - 48, 512, this.data.entities.cherry));

    console.info('World initialized');

    setInterval(() => {
      console.log(`entities : ${this.countVisibleObjects()}/${this.countAllObjects()}`);
    }, 1000);
  }

  public add(object: Object2d) {
    this.children.set(object.getUUID(), object);
  }

  public remove(object: Object2d) {
    this.children.delete(object.getUUID());
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

    this.tileMap.update(this, delta);
  }

  public render(alpha: number) {
    const viewProjectionMatrix = mat3.multiply(mat3.create(), this.viewMatrix, this.camera.getProjectionMatrix());

    this.children.forEach((child) => {
      child.render(viewProjectionMatrix);
    });

    // console.log(`entities : ${i}/${this.children.size}`);
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
    const choices = ['cherry', 'gemstone'];

    if (active && button === 0) {
      const coords = this.camera.screenToCameraCoords(position);
      const entity = new HealEffectConsummable(coords[0], coords[1], this.data.entities[choices[getRandomInt(0, choices.length)]]);

      this.add(entity);
    }
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
}

export default World;
