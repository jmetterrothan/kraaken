import Vector2 from '@shared/math/Vector2';
import AnimatedObject2d from '@src/objects/AnimatedObject2d';
import Object2d from '@src/objects/Object2d';
import Box2Helper from '@src/shared/helper/Box2Helper';
import Box2 from '@src/shared/math/Box2';
import TileMap from '@src/world/TileMap';
import World from '@src/world/World';

import { ITile } from '@shared/models/tilemap.model';
import { IEntityData, IMovement } from '@src/shared/models/entity.model';

class Entity extends AnimatedObject2d {
  protected bbox: Box2;
  protected bboxhelper: Box2Helper;

  protected climbing: boolean;
  protected falling: boolean;
  protected jumping: boolean;

  protected velocity: Vector2;

  constructor(x: number, y: number, direction: Vector2, data: IEntityData) {
    super(x, y, direction, data);

    this.bbox = new Box2(x, y, data.metadata.bbox.w, data.metadata.bbox.h);

    this.climbing = false;
    this.falling = false;
    this.jumping = false;

    this.velocity = new Vector2(0, 0);
  }

  public move(world: World, delta: number): void {
    this.velocity.add(world.getGravity());
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

  public handleCollisions(map: TileMap, delta: number) {
    const x1 = this.bbox.getMinX();
    const y1 = this.bbox.getMinY();
    const x2 = this.bbox.getMaxX();
    const y2 = this.bbox.getMaxY();

    const w = this.bbox.getWidth();
    const h = this.bbox.getHeight();

    const velocity = this.velocity.clone().multiplyScalar(delta);
    const newPosition = this.getPosition().add(velocity);

    if (this.velocity.x > 0) {
      // right collision
      const tile = this.testForCollision(map,
        x2 + velocity.x, y1,
        x2 + velocity.x, y1 + h / 2,
        x2 + velocity.x, y2,
      );

      if (tile) {
        newPosition.x = tile.position.x - w / 2 - 0.01;
        this.velocity.x = 0;
      }
    } else if (this.velocity.x < 0) {
      // left collision
      const tile = this.testForCollision(map,
        x1 + velocity.x, y1,
        x1 + velocity.x, y1 + h / 2,
        x1 + velocity.x, y2,
      );

      if (tile) {
        newPosition.x = tile.position.x + map.getTileSize() + w / 2 + 0.01;
        this.velocity.x = 0;
      }
    }

    if (this.velocity.y > 0) {
      // bottom collision
      const tile = this.testForCollision(map,
        x1, y2 + velocity.y,
        x1 + w / 2, y2 + velocity.y,
        x2, y2 + velocity.y,
      );

      if (tile !== undefined) {
        newPosition.y = tile.position.y - h / 2 - 0.01;
        this.velocity.y = 0;
      }
    } else if (this.velocity.y < 0) {
      // top collision
      const tile = this.testForCollision(map,
        x1, y1 + velocity.y,
        x1 + w / 2, y1 + velocity.y,
        x2, y1 + velocity.y,
      );

      if (tile) {
        newPosition.y = tile.position.y + map.getTileSize() + h / 2 + 0.01;
        this.velocity.y = 0;
      }
    }

    this.setPositionFromVector2(newPosition);
  }

  public update(world: World, delta: number) {
    // update velocity values
    if ('move' in this) {
      (this as IMovement).move(world, delta);
    }

    this.handleCollisions(world.getTileMap(), delta);
    this.clamp(world.getBoundaries());

    this.falling = this.velocity.y > 0;

    // change direction based of new velocity
    if (this.velocity.x !== 0 || this.velocity.y !== 0) {
      const direction = this.velocity.clone().setY(0).normalize();

      if (direction.x !== 0) {
        this.parameters.direction.x = direction.x;
      }
    }

    // update bbox position
    this.bbox.setPositionFromCenter(this.getX(), this.getY());

    // update animation and model matrix
    this.updateAnimation(world, delta);

    if (this.isDirty()) {
      this.remove(this.bboxhelper);
    }

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
        x = x1;
        this.velocity.x = 0;
    }
    if (this.getY() < y1) {
        y = y1;
        this.velocity.y = 0;
    }
    if (this.getX() > x2) {
        x = x2;
        this.velocity.x = 0;
    }
    if (this.getY() > y2) {
        y = y2;
        this.velocity.y = 0;
    }

    this.setPosition(x, y);
  }

  public getBbox(): Box2 { return this.bbox; }

  public getVelocity(): Vector2 {
    if (this.velocity) {
      return this.velocity.clone();
    }
    return new Vector2();
  }

  public getDirection(): Vector2 {
    return this.parameters.direction;
  }

  public getInterpolatedPosition(alpha: number, delta: number): Vector2 {
    const t = this.getVelocity().multiplyScalar(delta);
    return (this.getPosition().lerp(this.getPosition().add(t), alpha)).ceil();
  }

  public showDebug() {
    // create helper if it does not exist
    if (!this.bboxhelper) {
      this.bboxhelper = new Box2Helper(this.bbox, this.color);
      this.add(this.bboxhelper);
    }

    this.bboxhelper.setVisible(true);
  }

  public hideDebug() {
    if (this.bboxhelper) {
      this.bboxhelper.setVisible(false);
    }
  }

  private testForCollision(map: TileMap, a1x: number, a1y: number, b1x: number, b1y: number, c1x: number, c1y: number): ITile | undefined {
    const a = map.getTileAt(a1x, a1y);
    if (a && a.type.collision) { return a; }

    const b = map.getTileAt(b1x, b1y);
    if (b && b.type.collision) { return b; }

    const c = map.getTileAt(c1x, c1y);
    if (c && c.type.collision) { return c; }

    return undefined;
  }
}

export default Entity;
