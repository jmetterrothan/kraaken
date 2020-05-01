import { mat3, vec2 } from "gl-matrix";

import Projectile from "@src/objects/entity/Projectile";
import Box2 from "@shared/math/Box2";
import Vector2 from "@shared/math/Vector2";
import Level from "@src/world/Level";
import Sprite from "@src/animation/Sprite";
import Camera from "@src/Camera";
import Entity from "@src/objects/entity/Entity";
import NPC from "@src/objects/entity/NPC";
import Player from "@src/objects/entity/Player";
import EffectPotion from "@src/objects/loot/EffectPotion";
import Object2d from "@src/objects/Object2d";
import TileMap from "@src/world/TileMap";

import { configSvc } from "@shared/services/config.service";

import { ISpawnpoint } from "@src/shared/models/world.model";
import { IRGBAColorData } from "@src/shared/models/color.model";

import { gl } from "@src/Game";

class World {
  public readonly level: Level;

  protected children: Map<string, Object2d>;

  private viewMatrix: mat3;

  private camera: Camera;
  private tileMap: TileMap;
  private player: Player;

  private entities: Entity[];

  // physics
  private gravity: Vector2;

  constructor(level: Level) {
    this.level = level;

    this.children = new Map<string, Object2d>();

    this.viewMatrix = mat3.create();
    this.camera = new Camera();

    this.entities = [];
  }

  public async init() {
    for (const sprite of this.level.sprites) {
      await Sprite.create(sprite.src, sprite.name, sprite.tileWidth, sprite.tileHeight);
    }

    this.gravity = new Vector2(this.level.world.physics.gravity.x, this.level.world.physics.gravity.y);

    this.tileMap = new TileMap({
      ...this.level.world.tileMap,
      tileTypes: this.level.world.tileMap.tileTypes.reduce((acc, val) => {
        acc[`${val.row}:${val.col}`] = val;
        return acc;
      }, {}),
    });
    this.tileMap.init();

    this.camera.setBoundaries(this.tileMap.getBoundaries());

    this.setClearColor(this.level.world.background);

    this.initPlayer(this.level.world.spawnpoints.player);
    this.initEntities(this.level.world.spawnpoints.entities);
    this.initLoots(this.level.world.spawnpoints.loots);

    window.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.entities.forEach((entity) => {
          if (entity instanceof NPC) {
            entity.hasTarget(this.player) ? entity.unfollow() : entity.follow(this.player);
          }
        });
      }
    });

    console.info("World initialized");

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

  private initPlayer(data: ISpawnpoint) {
    this.player = this.spawn<Player>("player", data);
    this.camera.follow(this.player);
  }

  private initEntities(entities: ISpawnpoint[]) {
    for (const data of entities) {
      this.spawn("npc", data);
    }
  }

  private initLoots(loots: ISpawnpoint[]) {
    for (const data of loots) {
      this.spawn("loot", data);
    }
  }

  public setClearColor(color: IRGBAColorData) {
    gl.clearColor(color.r / 255, color.g / 255, color.b / 255, color.a / 255);
  }

  public add(object: Object2d) {
    this.children.set(object.getUUID(), object);
    // update entities list
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
    // delete children tree
    this.remove(object.getChildren());
    // perform tasks before removing it
    object.objectWillBeRemoved();
    // delete object from root
    this.children.delete(object.getUUID());

    // update entities list
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
    return this.countObjects(Array.from(this.children.values()), (object: Object2d) => object instanceof Object2d);
  }

  public countVisibleObjects(): number {
    return this.countObjects(Array.from(this.children.values()), (object: Object2d) => !object.isCulled() && object.isVisible());
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
    if (this.player) {
      this.player.handleKeyboardInput(key, active);
    }
  }

  public handleMouseLeftBtnPressed(active: boolean, position: vec2) {
    if (active) {
      // console.log("left click");
    }
  }

  public handleMouseMiddleBtnPressed(active: boolean, position: vec2) {
    if (active) {
      // console.log("middle click");
    }
  }

  public handleMouseRightBtnPressed(active: boolean, position: vec2) {
    if (active) {
      // console.log("right click");
    }
  }

  public handleMouseMove(position: vec2) {
    // const coords = this.camera.screenToCameraCoords(position);
    // console.log(coords.distanceTo(this.player.getPosition()));
  }

  public handleFullscreenChange(b: boolean) {}

  public handleResize() {
    this.camera.recenter();
  }

  // TODO: find object by uuid recursively
  public findObjectByUuid(uuid: string): Object2d {
    return this.children.get(uuid);
  }

  public despawn(uuid: string): boolean {
    const object = this.findObjectByUuid(uuid);

    if (object instanceof Object2d) {
      this.remove(object);
      return true;
    }
    return false;
  }

  public spawn<T extends Object2d = Object2d>(type: string, spawnpoint: ISpawnpoint): T {
    const { uuid, ref, position, direction, metadata } = spawnpoint;

    let C;
    let data;

    switch (type) {
      case "player":
        C = Player;
        data = this.level.entities[ref];
        break;
      case "projectile":
        C = Projectile;
        data = this.level.loots[ref];
        break;
      case "loot":
        C = EffectPotion;
        data = this.level.loots[ref];
        break;
      case "npc":
        C = Entity;
        data = this.level.entities[ref];
        break;
      default:
        throw new Error(`Tried to spawn an unknown object "${type}"`);
    }

    const object = new C(
      uuid,
      position.x, //
      position.y,
      new Vector2(direction.x, direction.y),
      data
    );

    if ("showDebug" in object && metadata.debug) {
      object.showDebug();
    }

    this.add(object);

    return object;
  }

  public getPlayer(): Player {
    return this.player;
  }
  public getCamera(): Camera {
    return this.camera;
  }
  public getTileMap(): TileMap {
    return this.tileMap;
  }
  public getBoundaries(): Box2 {
    return this.tileMap.getBoundaries();
  }
  public getGravity(): Vector2 {
    return this.gravity;
  }
}

export default World;
