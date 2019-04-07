import { mat3, vec3, vec2 } from "gl-matrix";

import { canvas } from "@src/Game";
import Animation from '@src/animation/Animation';
import Sprite from '@src/animation/Sprite';
import Camera from '@src/Camera';
import Box2d from "@src/Box2d";

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

class World {
  private test1: Box2d;
  private test2: Animation;

  private worldSpaceMatrix: mat3;
  private camera: Camera;

  private boundaries: Box2d;

  constructor() {
    this.worldSpaceMatrix = mat3.create();
    this.camera = new Camera();
  }

  async init() {
    await Sprite.create(imgAtlas32x32, 'atlas', 32, 32);

    this.test1 = new Box2d(128, 128, 32, 32);
    this.test2 = new Animation('idle', LOOT_CHERRY.animations.idle);

    this.boundaries = new Box2d(0, 0, 16 * 32, 16 * 32);

    this.camera.follow(this.test1);

    console.info('World initialized');
  }

  update(delta: number) {
    mat3.projection(this.worldSpaceMatrix, canvas.width, canvas.height);

    this.test1.update(delta);
    this.test2.update();

    this.camera.clamp(this.boundaries);
    this.camera.update(delta);
  }

  render(alpha: number) {
    this.test2.render(this.worldSpaceMatrix, this.camera.getViewMatrix(), this.test1.getModelMatrix(), vec2.fromValues(1, 1));
  }
  
  handleKeyboardInput(key: string, active: boolean) {
    
  }

  handleMousePressed(button: number, active: boolean, position: vec2) {

  }

  handleMouseMove(position: vec2) {
    
  }
  
  handleFullscreenChange(b: boolean) {
    this.camera.recenter();
  }
}

export default World;