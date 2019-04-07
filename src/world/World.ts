import { mat3, vec3, vec2 } from "gl-matrix";

import { canvas } from "@src/Game";
import Animation from '@src/animation/Animation';
import Sprite from '@src/animation/Sprite';
import Camera from '@src/Camera';
import Box2d from "@src/Box2d";
import Object2d from "@src/Object2d";

import { configSvc } from "@src/shared/services/config.service";

import imgAtlas32x32 from '@assets/textures/atlas32x32.png';

const LOOT_CHERRY = {
  type: 'CHERRY',
  width: 16,
  height: 16,
  offset: { left: 8, top: 8 },
  animations: {
      idle: {
          sprite: 'atlas',
          loop:  true,
          keyframes: [
              { row: 1, col:  0, duration: 75 },
              { row: 1, col:  1, duration: 75 },
              { row: 1, col:  2, duration: 75 },
              { row: 1, col:  3, duration: 75 },
              { row: 1, col:  4, duration: 75 },
              { row: 1, col:  5, duration: 75 },
              { row: 1, col:  6, duration: 75 },
          ]
      }
  }
};

class Entity extends Box2d {
  private animation: Animation;

  constructor(x: number, y: number) {
    super(x, y, 32, 32);
    this.animation = new Animation('idle', LOOT_CHERRY.animations.idle);
  }

  update(delta: number) {
    this.animation.update();
    this.updateModelMatrix();
  }

  render(worldSpaceMatrix: mat3, viewMatrix: mat3) {
    this.animation.render(worldSpaceMatrix, viewMatrix, this.modelMatrix, vec2.fromValues(1, 1));
  }
}

class World {
  private worldSpaceMatrix: mat3;
  private camera: Camera;

  private boundaries: Box2d;

  protected entities: Entity[];

  constructor() {
    this.worldSpaceMatrix = mat3.create();
    this.camera = new Camera();

    this.boundaries = new Box2d(0, 0, 4096, 2048);

    this.entities = [];
  }

  async init() {
    await Sprite.create(imgAtlas32x32, 'atlas', 32, 32);

    const player = new Entity(3072, 1024);
    this.add(player);

    this.camera.follow(player);

    console.info('World initialized');
  }

  add(object: Entity) {
    this.entities.push(object);
  }

  update(delta: number) {
    mat3.projection(this.worldSpaceMatrix, configSvc.frameSize.w, configSvc.frameSize.h);

    for (const entity of this.entities) {
      entity.update(delta);
    }

    this.camera.clamp(this.boundaries);
    this.camera.update(delta);
  }

  render(alpha: number) {
    for (const entity of this.entities) {
      entity.render(this.worldSpaceMatrix, this.camera.getViewMatrix());
    }
  }
  
  handleKeyboardInput(key: string, active: boolean) {
    
  }

  handleMousePressed(button: number, active: boolean, position: vec2) {
    if (active) {
      const coords = this.camera.screenToCameraCoords(position);
      const entity = new Entity(coords[0] - 16, coords[1] - 16);

      this.add(entity);
    }
  }

  handleMouseMove(position: vec2) {
    
  }
  
  handleFullscreenChange(b: boolean) {
    this.camera.recenter();
  }
}

export default World;