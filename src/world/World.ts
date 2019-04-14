import { mat3, vec2 } from "gl-matrix";

import Sprite from '@src/animation/Sprite';
import Camera from '@src/Camera';
import Entity from '@src/objects/Entity';
import Box2 from '@shared/math/Box2';
import Vector2 from '@shared/math/Vector2';
import Object2d from '@src/objects/Object2d';

import { configSvc } from '@shared/services/config.service';

import { IWorldData } from '@src/shared/models/world.model';

class World {
  private data: IWorldData;

  private viewMatrix: mat3;
  private camera: Camera;

  private boundaries: Box2;

  protected children: Map<string, Object2d>;

  constructor(data: IWorldData) {
    this.data = data;

    this.viewMatrix = mat3.create();
    this.camera = new Camera();

    const w = data.cols * 32;
    const h = data.rows * 32;
    this.boundaries = new Box2(w / 2, h / 2, w, h);

    this.children = new Map<string, Object2d>();
  }
  
  async init() {
    for (const sprite of this.data.sprites) {
      await Sprite.create(sprite.src, sprite.name, sprite.tileWidth, sprite.tileHeight);
    }

    const player = new Entity(64, 64, this.data.characters.fox);
    this.add(player);
    this.add(new Entity(0, 0, this.data.characters.cherry));

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

    this.children.forEach(child => {
      if (!child.isVisible() || this.camera.isFrustumCulled(child)) {
        return;
      }

      child.render(viewProjectionMatrix);
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
      const entity = new Entity(coords[0] - 16, coords[1] - 16, this.data.characters.cherry);
      
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