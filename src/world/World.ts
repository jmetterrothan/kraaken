import { mat3, vec2 } from "gl-matrix";

import Sprite from '@src/animation/Sprite';
import Camera from '@src/Camera';

import Entity from "@src/objects/Entity";
import Box2 from "@shared/math/Box2";
import Vector2 from '@shared/math/Vector2';

import { configSvc } from "@shared/services/config.service";

import imgAtlas32x32 from '@assets/textures/atlas32x32.png';

const LOOT_CHERRY = {
  defaultAnimationKey: 'idle',
  animationList: {
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
  private viewMatrix: mat3;
  private camera: Camera;

  private boundaries: Box2;

  protected entities: Entity[];

  constructor() {
    this.viewMatrix = mat3.create();
    this.camera = new Camera();

    this.boundaries = new Box2(0, 0, 800, 600);

    this.entities = [];
  }
  
  async init() {
    await Sprite.create(imgAtlas32x32, 'atlas', 32, 32);

    const player = new Entity(400, 300, LOOT_CHERRY);
    this.add(player);

    this.camera.follow(player);

    console.info('World initialized');
  }

  add(object: Entity) {
    this.entities.push(object);
  }

  update(delta: number) {
    mat3.projection(this.viewMatrix, configSvc.frameSize.w, configSvc.frameSize.h);

    for (const entity of this.entities) {
      entity.update(delta);
    }

    this.camera.clamp(this.boundaries);
    this.camera.update(delta);
  }

  render(alpha: number) {
    const viewProjectionMatrix = mat3.multiply(mat3.create(), this.viewMatrix, this.camera.getProjectionMatrix());

    let i = 0;
    for (const entity of this.entities) {
      if (!entity.isVisible() || this.camera.isFrustumCulled(entity)) {
        continue;
      }

      entity.render(viewProjectionMatrix);
      i++;
    }

    // console.log(`entities : ${i}/${this.entities.length}`);
  }
  
  handleKeyboardInput(key: string, active: boolean) {
    
  }

  handleMousePressed(button: number, active: boolean, position: vec2) {
    if (active) {
      const coords = this.camera.screenToCameraCoords(position);
      const entity = new Entity(coords[0] - 16, coords[1] - 16, LOOT_CHERRY);
      
      if (this.boundaries.containsPoint(new Vector2(coords[0], coords[1]))) {
        this.add(entity);
      }
    }
  }

  handleMouseMove(position: vec2) {
    
  }
  
  handleFullscreenChange(b: boolean) {
  
  }

  handleResize() {
    this.camera.recenter();
  }
}

export default World;