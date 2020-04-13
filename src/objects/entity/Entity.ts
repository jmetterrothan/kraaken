import { mat3 } from "gl-matrix";

import Vector2 from "@shared/math/Vector2";
import AnimatedObject2d from "@src/objects/AnimatedObject2d";
import Object2d from "@src/objects/Object2d";
import Box2Helper from "@src/shared/helper/Box2Helper";
import Box2 from "@src/shared/math/Box2";
import TileMap from "@src/world/TileMap";
import World from "@src/world/World";
import Tile from "@src/world/Tile";

import { IEntity, IMovement } from "@src/shared/models/entity.model";

class Entity extends AnimatedObject2d {
  protected bbox: Box2;
  protected bboxhelper: Box2Helper;

  protected climbing: boolean;
  protected falling: boolean;
  protected jumping: boolean;

  protected canJump: boolean;

  protected readonly collide: boolean;
  protected readonly gravity: boolean;

  protected velocity: Vector2;

  constructor(x: number, y: number, direction: Vector2, data: IEntity) {
    super(x, y, direction, data);

    this.collide = "collide" in data.metadata ? data.metadata.collide : true;
    this.gravity = "gravity" in data.metadata ? data.metadata.gravity : true;

    const width = "bbox" in data.metadata ? data.metadata.bbox.w : 0;
    const height = "bbox" in data.metadata ? data.metadata.bbox.h : 0;

    this.bbox = Box2.createFromCenterPoint(x, y, width, height);

    this.climbing = false;
    this.falling = false;
    this.jumping = false;

    this.canJump = false;

    this.velocity = new Vector2(0, 0);
  }

  public move(world: World, delta: number): void {
    if (this.gravity) {
      const g = world.getGravity();
      this.velocity.add(g.clone().multiplyScalar(delta));

      if (this.velocity.y > g.y) {
        this.velocity.y = g.y;
      }
    }
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
    const velocity = this.velocity.clone().multiplyScalar(delta);
    const newPosition = this.getPosition().add(velocity);

    if (this.collide) {
      const x1 = this.bbox.getMinX();
      const y1 = this.bbox.getMinY();
      const x2 = this.bbox.getMaxX();
      const y2 = this.bbox.getMaxY();

      const w = this.bbox.getWidth();
      const h = this.bbox.getHeight();

      if (velocity.y > 0) {
        // bottom collision
        const tile = this.testForCollision(map, x1, y2 + velocity.y, x1 + w / 2, y2 + velocity.y, x2, y2 + velocity.y);

        if (tile) {
          newPosition.y = tile.position.y - h / 2 - 0.01;
          this.velocity.y = 0;
        }
      } else if (velocity.y < 0) {
        // top collision
        const tile = this.testForCollision(map, x1, y1 + velocity.y, x1 + w / 2, y1 + velocity.y, x2, y1 + velocity.y);

        if (tile) {
          newPosition.y = tile.position.y + map.getTileSize() + h / 2 + 0.01;
          this.velocity.y = 0;
        }
      }

      if (velocity.x > 0) {
        // right collision
        const tile = this.testForCollision(map, x2 + velocity.x, y1, x2 + velocity.x, y1 + h / 2, x2 + velocity.x, y2);

        if (tile) {
          newPosition.x = tile.position.x - w / 2 - 0.001;
          this.velocity.x = 0;
        }
      } else if (velocity.x < 0) {
        // left collision
        const tile = this.testForCollision(map, x1 + velocity.x, y1, x1 + velocity.x, y1 + h / 2, x1 + velocity.x, y2);

        if (tile) {
          newPosition.x = tile.position.x + map.getTileSize() + w / 2 + 0.01;
          this.velocity.x = 0;
        }
      }
    }

    this.setPositionFromVector2(newPosition);
  }

  public isOnSolidTile(map: TileMap): boolean {
    const x1 = this.bbox.getMinX();
    const x2 = this.bbox.getMaxX();
    const y = this.bbox.getMaxY() + 0.01;

    const tile = this.testForCollision(map, x1, y, x1 + this.bbox.getWidth() / 2, y, x2, y);

    return tile !== undefined;
  }

  public update(world: World, delta: number) {
    // update velocity values
    if ("move" in this) {
      (this as IMovement).move(world, delta);
    }

    this.handleCollisions(world.getTileMap(), delta);
    this.clampTo(world.getBoundaries());
    this.falling = this.velocity.y > 0;
    this.canJump = this.isOnSolidTile(world.getTileMap());

    this.calculateDirectionVector();

    // update bbox position
    this.bbox.setPositionFromCenter(this.getX(), this.getY());

    // update animation and model matrix
    this.updateAnimation();

    if (this.isDirty()) {
      this.remove(this.bboxhelper);
    }

    super.update(world, delta);
  }

  // change direction based of current velocity
  private calculateDirectionVector() {
    if (this.velocity.x !== 0 || this.velocity.y !== 0) {
      const direction = this.velocity.clone().setY(0).normalize();

      if (direction.x !== 0) {
        this.parameters.direction.x = direction.x;
      }
    }
  }

  public clampTo(boundaries: Box2) {
    if (!this.collide) {
      return;
    }

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

  public getBbox(): Box2 {
    return this.bbox;
  }

  public getVelocity(): Vector2 {
    if (this.velocity) {
      return this.velocity.clone();
    }
    return new Vector2();
  }

  public setVelocity(x: number, y: number) {
    this.velocity.x = x;
    this.velocity.y = y;
  }

  public setVelocityX(x: number) {
    this.velocity.x = x;
  }

  public setVelocityY(y: number) {
    this.velocity.y = y;
  }

  public getDirection(): Vector2 {
    return this.parameters.direction;
  }

  public getInterpolatedPosition(alpha: number, delta: number): Vector2 {
    const t = this.getVelocity().multiplyScalar(delta);
    return this.getPosition().lerp(this.getPosition().add(t), alpha).ceil();
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

  public isColliding(): boolean {
    return this.collide;
  }

  public isFloating(): boolean {
    return !this.gravity;
  }

  private testForCollision(map: TileMap, a1x: number, a1y: number, b1x: number, b1y: number, c1x: number, c1y: number): Tile | undefined {
    const a = map.getTileAt(a1x, a1y);
    if (a && a.collision) {
      return a;
    }

    const b = map.getTileAt(b1x, b1y);
    if (b && b.collision) {
      return b;
    }

    const c = map.getTileAt(c1x, c1y);
    if (c && c.collision) {
      return c;
    }

    return undefined;
  }

  protected updateModelMatrix() {
    const offset = this.animation.getOffset();

    this.modelMatrix = mat3.fromTranslation(mat3.create(), this.getPosition().addScalar(0.01).add(offset).trunc().toGlArray());
  }
}

export default Entity;
