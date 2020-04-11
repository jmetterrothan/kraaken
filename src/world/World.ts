import { ISpawnpoint } from "@src/shared/models/world.model";
import { mat3, vec2 } from "gl-matrix";

import Box2 from "@shared/math/Box2";
import Vector2 from "@shared/math/Vector2";
import Level from "@src/world/Level";
import Sprite from "@src/animation/Sprite";
import Camera from "@src/Camera";
import Entity from "@src/objects/entity/Entity";
import NPC from "@src/objects/entity/NPC";
import Player from "@src/objects/entity/Player";
import DamageEffectConsummable from "@src/objects/loot/DamageEffectConsummable";
import Object2d from "@src/objects/Object2d";
import TileMap from "@src/world/TileMap";

import { configSvc } from "@shared/services/config.service";

import { IPlayer } from "./../shared/models/entity.model";
import { IRGBAColorData } from "@src/shared/models/color.model";

import { getRandomInt } from "@src/shared/utility/MathHelpers";

import { gl } from "@src/Game";

class World {
  public readonly level: Level;

  protected children: Map<string, Object2d>;

  private viewMatrix: mat3;

  private camera: Camera;
  private tileMap: TileMap;
  private player: Player;

  private entities: Entity[];

  private selectedTileTypeId: string;
  private selectedLayerId: 0 | 1 | 2;

  // physics
  private gravity: Vector2;

  constructor(level: Level) {
    this.level = level;

    this.children = new Map<string, Object2d>();

    this.viewMatrix = mat3.create();
    this.camera = new Camera();

    this.entities = [];

    this.selectedTileTypeId = "0";
    this.selectedLayerId = 1;
  }

  public async init() {
    for (const sprite of this.level.sprites) {
      await Sprite.create(sprite.src, sprite.name, sprite.tileWidth, sprite.tileHeight);
    }

    this.gravity = new Vector2(this.level.world.physics.gravity.x, this.level.world.physics.gravity.y);

    this.tileMap = new TileMap(this.level.world.tileMap);
    this.tileMap.init();

    this.setClearColor(this.level.world.background);

    this.initPlayer(this.level.world.player);
    this.initEntities(this.level.world.entities);
    this.initLoots(this.level.world.loots);

    this.camera.setBoundaries(this.tileMap.getBoundaries());
    this.camera.follow(this.player);

    window.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.entities.forEach((entity) => {
          if (entity instanceof NPC) {
            entity.hasTarget(this.player) ? entity.unfollow() : entity.follow(this.player);
          }
        });
      }
    });

    window.addEventListener("change_tiletype", (e: CustomEvent) => {
      this.selectedTileTypeId = e.detail.id;
    });

    window.addEventListener("change_layer", (e: CustomEvent) => {
      this.selectedLayerId = e.detail.id;
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

  public setClearColor(color: IRGBAColorData) {
    gl.clearColor(color.r / 255, color.g / 255, color.b / 255, color.a / 255);
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
    this.player.handleKeyboardInput(key, active);
  }

  public handleMouseLeftBtnPressed(active: boolean, position: vec2) {
    if (active) {
      const coords = this.camera.screenToCameraCoords(position);
      const tile = this.tileMap.getTileAt(coords.x, coords.y);

      if (tile) {
        tile.activeSlot = this.selectedLayerId as 1 | 2;

        if (tile.empty || tile.slot.key !== this.level.world.tileMap.tileTypes[this.selectedTileTypeId].key) {
          tile.slot = this.level.world.tileMap.tileTypes[this.selectedTileTypeId];
        } else {
          tile.slot = this.level.world.tileMap.tileTypes.void;
        }
      } else {
        console.warn("no tile found");
      }
    }
  }

  public handleMouseMiddleBtnPressed(active: boolean, position: vec2) {
    if (active) {
      const choices = Object.keys(this.level.loots);
      const coords = this.camera.screenToCameraCoords(position);

      const lootData = this.level.loots[choices[getRandomInt(0, choices.length)]];

      const loot = new DamageEffectConsummable(coords.x, coords.y, new Vector2(1, 1), lootData);
      this.add(loot);
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

  private initPlayer(data: ISpawnpoint) {
    this.player = new Player(
      data.spawn.x, //
      data.spawn.y,
      new Vector2(data.direction.x, data.direction.y),
      this.level.entities[data.ref] as IPlayer
    );

    if (data.metadata.debug) {
      this.player.showDebug();
    }
    this.add(this.player);
  }

  private initEntities(entities: ISpawnpoint[]) {
    for (const entityLevelData of entities) {
      const { ref, spawn, direction, metadata } = entityLevelData;
      const npc = new NPC(
        spawn.x, //
        spawn.y,
        new Vector2(direction.x, direction.y),
        this.level.entities[ref]
      );

      if (metadata.debug) {
        npc.showDebug();
      }
      this.add(npc);
    }
  }

  private initLoots(loots: ISpawnpoint[]) {
    for (const lootLevelData of loots) {
      const { ref, spawn, direction, metadata } = lootLevelData;
      const lootData = this.level.loots[ref];

      const loot = new DamageEffectConsummable(
        spawn.x, //
        spawn.y,
        new Vector2(direction.x, direction.y),
        lootData
      );

      if (metadata.debug) {
        loot.showDebug();
      }
      this.add(loot);
    }
  }
}

export default World;
