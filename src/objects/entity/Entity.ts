import Vector2 from '@shared/math/Vector2';
import AnimatedObject2d from '@src/objects/AnimatedObject2d';
import Object2d from '@src/objects/Object2d';
import Box2 from '@src/shared/math/Box2';
import TileMap from '@src/world/TileMap';
import World from '@src/world/World';

import { IEntityData, IMovement } from '@src/shared/models/entity.model';
import { mat3 } from 'gl-matrix';

class Entity extends AnimatedObject2d {
  protected velocity: Vector2;
  protected bbox: Box2;

  protected climbing: boolean;
  protected falling: boolean;
  protected jumping: boolean;

  constructor(x: number, y: number, direction: Vector2, data: IEntityData) {
    super(x, y, direction, data);

    this.velocity = new Vector2(0, 0);
    this.bbox = new Box2(x, y, data.metadata.bbox.w, data.metadata.bbox.h);

    this.climbing = false;
    this.falling = false;
    this.jumping = false;

  }

  public collideWith(object: Entity | Object2d): boolean {
    if (object instanceof Entity && this.bbox.intersectBox((object as Entity).getBbox())) {
      return true;
    }

    if (object instanceof Object2d && this.bbox.containsPoint(object.getPosition())) {
      return true;
    }

    return false;
  }

  public updatePosition(world: World, delta: number) {
    // update velocity values
    if ('move' in this) {
      (this as IMovement).move(delta);
    }

    // change direction based of new velocity
    if (this.velocity.x !== 0 || this.velocity.y !== 0) {
      const direction = this.velocity.clone().setY(0).normalize();

      if (direction.x !== 0) {
        this.direction.x = direction.x;
      }

      this.setPositionFromVector2(this.getPosition().add(this.velocity.clone().multiplyScalar(delta)));
    }
  }

  public handleCollisions(map: TileMap, delta: number) {
    const x1 = this.bbox.getMinX();
    const y1 = this.bbox.getMinY();
    const x2 = this.bbox.getMaxX();
    const y2 = this.bbox.getMaxY();
    const w = this.bbox.getWidth();
    const h = this.bbox.getHeight();

    const velocity = this.velocity.clone().multiplyScalar(delta);

    let x = this.getX();
    let y = this.getY();

    // bottom collision
    if (this.velocity.y > 0) {
      const tl = map.getTileAt(x1, y2 + velocity.y);
      const tr = map.getTileAt(x2, y2 + velocity.y);

      const tile = (tl && tl.type.collision) ? tl : ((tr && tr.type.collision) ? tr : undefined);

      if (tile) {
        y = tile.position.y - h / 2 - 0.01;
        this.velocity.y = 0;
        this.falling = false;
      }
    }

    // top collision
    if (this.velocity.y < 0) {
      const bl = map.getTileAt(x1, y1 + velocity.y);
      const br = map.getTileAt(x2, y1 + velocity.y);

      const tile = (bl && bl.type.collision) ? bl : ((br && br.type.collision) ? br : undefined);

      if (tile) {
        y = tile.position.y + map.getTileSize() + h / 2 + 0.01;
        this.velocity.y = 0;
      }
    }

    // right collision
    if (this.velocity.x > 0) {
      const tr = map.getTileAt(x2 + velocity.x, y1);
      const br = map.getTileAt(x2 + velocity.x, y2);

      const tile = (tr && tr.type.collision) ? tr : ((br && br.type.collision) ? br : undefined);

      if (tile) {
        x = tile.position.x - w / 2 - 0.01;
        this.velocity.x = 0;
      }
    }

    // left collision
    if (this.velocity.x < 0) {
      const tl = map.getTileAt(x1 + velocity.x, y1);
      const bl = map.getTileAt(x1 + velocity.x, y2);

      const tile = (tl && tl.type.collision) ? tl : ((bl && bl.type.collision) ? bl : undefined);

      if (tile) {
        x = tile.position.x + map.getTileSize() + w / 2 + 0.01;
        this.velocity.x = 0;
      }
    }

    this.setPosition(x, y);
  }

  public update(world: World, delta: number) {
    this.updatePosition(world, delta);

    this.handleCollisions(world.getTileMap(), delta);
    this.clamp(world.getBoundaries());
    this.falling = this.velocity.y > 0;
    this.bbox.setPositionFromCenter(this.getX(), this.getY());

    this.updateAnimation(world, delta);
    super.update(world, delta);
  }

  public clamp(boundaries: Box2) {
    const bboxHWidth = this.bbox.getWidth() / 2;
    const bboxHHeight = this.bbox.getHeight() / 2;

    const x1 = boundaries.getMinX() + bboxHWidth;
    const x2 = boundaries.getMaxX() - bboxHWidth;
    const y1 = boundaries.getMinY() + bboxHHeight;
    const y2 = boundaries.getMaxY() - bboxHHeight;

    let x = this.getX();
    let y = this.getY();

    if (this.getX() < x1) {
        x = x1 + 0.01;
        this.velocity.x = 0;
    }
    if (this.getY() < y1) {
        y = y1 + 0.01;
        this.velocity.y = 0;
    }
    if (this.getX() > x2) {
        x = x2 - 0.01;
        this.velocity.x = 0;
    }
    if (this.getY() > y2) {
        y = y2 - 0.01;
        this.velocity.y = 0;
    }

    if (x !== this.getX() || y !== this.getY()) {
      this.setPosition(x, y);
    }

    this.bbox.setPositionFromCenter(x, y);
  }

  public getBbox(): Box2 { return this.bbox; }
}

export default Entity;
