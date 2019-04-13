import { mat3, vec2 } from "gl-matrix";

import Sprite from '@src/animation/Sprite';
import Camera from '@src/Camera';

import Entity from '@src/objects/Entity';
import Box2 from '@shared/math/Box2';
import Vector2 from '@shared/math/Vector2';
import Object2d from '@src/objects/Object2d';
import Lifo from "@src/shared/utility/Lifo";

import { configSvc } from '@shared/services/config.service';
import { IEntityData } from '@src/shared/models/entity.model';

import imgAtlas32x32 from '@assets/textures/atlas32x32.png';

const CherryCfg: IEntityData = {
  defaultState: {
    orientation: {
      x: 1,
      y: 1
    }
  },
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

  protected children: Map<string, Object2d>;

  constructor() {
    this.viewMatrix = mat3.create();
    this.camera = new Camera();

    this.boundaries = new Box2(0, 0, 800, 600);

    this.children = new Map<string, Object2d>();
  }
  
  async init() {
    await Sprite.create(imgAtlas32x32, 'atlas', 32, 32);

    const player = new Entity(400, 300, CherryCfg);
    this.add(player);

    this.camera.follow(player);

    console.info('World initialized');
  }

  add(object: Object2d) {
    this.children.set(object.getUUID(), object);
  }

  delete(object: Object2d) {
    this.children.delete(object.getUUID());
  }

  update(delta: number) {
    mat3.projection(this.viewMatrix, configSvc.frameSize.w, configSvc.frameSize.h);

    this.children.forEach((child: Object2d) => {
      if (this.canBeCleanedUp(child)) {
        this.delete(child);
        return;
      }

      child.update(delta);
    });

    this.camera.clamp(this.boundaries);
    this.camera.update(delta);
  }

  render(alpha: number) {
    const viewProjectionMatrix = mat3.multiply(mat3.create(), this.viewMatrix, this.camera.getProjectionMatrix());

    let i = 0;
    this.children.forEach(child => {
      if (!child.isVisible() || this.camera.isFrustumCulled(child)) {
        return;
      }

      child.render(viewProjectionMatrix);
      i++;
    });

    // console.log(`entities : ${i}/${this.entities.length}`);
  }
  
  canBeCleanedUp(object: Object2d): boolean {
    // TODO: clean only if all children are dirty too
    return object.isDirty();
  }

  handleKeyboardInput(key: string, active: boolean) {
    
  }

  handleMousePressed(button: number, active: boolean, position: vec2) {
    if (active && button === 0) {
      const coords = this.camera.screenToCameraCoords(position);
      const entity = new Entity(coords[0] - 16, coords[1] - 16, LOOT_CHERRY);
      
      if (this.boundaries.containsPoint(new Vector2(coords[0], coords[1]))) {
        setTimeout(() => entity.setDirty(true), 2000);
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