import { Entity, System } from "@src/ECS";
import { Collider, Position, BoundingBox, RigidBody, Movement } from "@src/ECS/components";

import { ITile } from "@shared/models/tilemap.model";
import Vector2 from "@shared/math/Vector2";

import World from "@src/world/World";
import TileMap from "@src/world/TileMap";

export class PhysicsSystem extends System {
  public constructor() {
    super([Position.COMPONENT_TYPE, RigidBody.COMPONENT_TYPE]);
  }

  public addedToWorld(world: World): void {
    super.addedToWorld(world);

    world.entityAdded$([Position.COMPONENT_TYPE, BoundingBox.COMPONENT_TYPE]).subscribe((entity) => {
      const position = entity.getComponent(Position);
      const bbox = entity.getComponent(BoundingBox);

      // sync bbox position
      bbox.setPositionFromVector2(position);
    });
  }

  execute(delta: number): void {
    const entities = this.world.getEntities(this.componentTypes);
    if (entities.length === 0) {
      return;
    }

    const colliders = this.world.getEntities([Position.COMPONENT_TYPE, BoundingBox.COMPONENT_TYPE, Collider.COMPONENT_TYPE]);

    entities.forEach((entity) => {
      const position = entity.getComponent(Position);
      const bbox = entity.getComponent(BoundingBox);
      const rigidBody = entity.getComponent(RigidBody);

      // save previous velocity/pos for later
      position.previousValue.copy(position);
      rigidBody.previousVelocity.copy(rigidBody.velocity);

      // apply gravity
      if (rigidBody.gravity) {
        rigidBody.velocity.y += this.world.gravity * delta;

        if (rigidBody.velocity.y > this.world.gravity) {
          rigidBody.velocity.y = this.world.gravity;
        }
      }

      // we move one step
      const step = rigidBody.velocity.clone().multiply(rigidBody.velocityModifier).multiply(rigidBody.direction).multiplyScalar(delta);
      position.add(step);

      rigidBody.isGrounded = this.isOnSolidTile(entity);

      this.collideWithMap(entity, step, delta);

      if (entity.hasComponent(BoundingBox.COMPONENT_TYPE)) {
        this.collideWithBoundingBox(entity, colliders, step, delta);
      }

      if (rigidBody.clamToMap) {
        this.clampToMap(entity);
      }

      // sync bbox position
      if (bbox) {
        bbox.setPositionFromVector2(position);
      }
    });
  }

  public clampToMap(entity: Entity): void {
    const position = entity.getComponent(Position);
    const rigidBody = entity.getComponent(RigidBody);
    const bbox = entity.getComponent(BoundingBox);

    const boundaries = this.world.tileMap.getBoundaries();

    const w = bbox?.width ?? 0;
    const h = bbox?.height ?? 0;

    const x1 = boundaries.x1 + w;
    const x2 = boundaries.x2 - w;
    const y1 = boundaries.y1 + h;
    const y2 = boundaries.y2 - h;

    let x = position.x;
    let y = position.y;

    if (position.x < x1) {
      x = x1;
      rigidBody.velocity.x = 0;
    }
    if (position.y < y1) {
      y = y1;
      rigidBody.velocity.y = 0;
    }
    if (position.x > x2) {
      x = x2;
      rigidBody.velocity.x = 0;
    }
    if (position.y > y2) {
      y = y2;
      rigidBody.velocity.y = 0;
    }

    position.fromValues(x, y);
  }

  public handleCollisionWithBottomSide(entity: Entity, bbox: BoundingBox | ITile, delta: number): void {
    const position = entity.getComponent(Position);
    const rigidBody = entity.getComponent(RigidBody);

    if (rigidBody.reflect) {
      const n = Vector2.create(0, -1);
      const r = rigidBody.velocity.reflect(n);
      if (rigidBody.reflectAngle) {
        position.rotation = Math.atan2(r.y, r.x);
      }
      rigidBody.velocity.fromValues(r.x, r.y).multiplyScalar(rigidBody.bounciness);

      if (rigidBody.velocity.x > 0) {
        rigidBody.velocity.x -= 8 * delta;
        if (rigidBody.velocity.x < 0) {
          rigidBody.velocity.x = 0;
        }
      }

      Vector2.destroy(n);

      if (rigidBody.reflectVFX) {
        this.world.playEffectOnceAt(rigidBody.reflectVFX, { x: position.x, y: bbox.y1 });
      }
    } else {
      rigidBody.velocity.y = 0;
    }
  }

  public handleCollisionWithTopSide(entity: Entity, bbox: BoundingBox | ITile, delta: number): void {
    const position = entity.getComponent(Position);
    const rigidBody = entity.getComponent(RigidBody);

    if (rigidBody.reflect) {
      const n = Vector2.create(0, 1);
      const r = rigidBody.velocity.reflect(n);
      if (rigidBody.reflectAngle) {
        position.rotation = Math.atan2(r.y, r.x);
      }
      rigidBody.velocity.fromValues(r.x, r.y).multiplyScalar(rigidBody.bounciness);

      if (rigidBody.velocity.x > 0) {
        rigidBody.velocity.x -= 8 * delta;
        if (rigidBody.velocity.x < 0) {
          rigidBody.velocity.x = 0;
        }
      }

      Vector2.destroy(n);

      if (rigidBody.reflectVFX) {
        this.world.playEffectOnceAt(rigidBody.reflectVFX, { x: position.x, y: bbox.y2 });
      }
    } else {
      rigidBody.velocity.y = 0;
    }
  }

  public handleCollisionWithLeftSide(entity: Entity, bbox: BoundingBox | ITile, delta: number): void {
    const position = entity.getComponent(Position);
    const rigidBody = entity.getComponent(RigidBody);

    if (rigidBody.reflect) {
      const n = Vector2.create(1, 0);
      const r = rigidBody.velocity.reflect(n);
      if (rigidBody.reflectAngle) {
        position.rotation = Math.atan2(r.y, r.x);
      }
      rigidBody.velocity.fromValues(r.x, r.y).multiplyScalar(rigidBody.bounciness);

      Vector2.destroy(n);

      if (rigidBody.reflectVFX) {
        this.world.playEffectOnceAt(rigidBody.reflectVFX, { x: bbox.x1, y: position.y });
      }
    } else {
      rigidBody.velocity.x = 0;
    }
  }

  public handleCollisionWithRightSide(entity: Entity, bbox: BoundingBox | ITile, delta: number): void {
    const position = entity.getComponent(Position);
    const rigidBody = entity.getComponent(RigidBody);

    if (rigidBody.reflect) {
      const n = Vector2.create(-1, 0);
      const r = rigidBody.velocity.reflect(n);
      if (rigidBody.reflectAngle) {
        position.rotation = Math.atan2(r.y, r.x);
      }
      rigidBody.velocity.fromValues(r.x, r.y).multiplyScalar(rigidBody.bounciness);

      Vector2.destroy(n);

      if (rigidBody.reflectVFX) {
        this.world.playEffectOnceAt(rigidBody.reflectVFX, { x: bbox.x2, y: position.y });
      }
    } else {
      rigidBody.velocity.x = 0;
    }
  }

  public collideWithBoundingBox(entity: Entity, colliders: readonly Entity[], step: Vector2, delta: number): void {
    const bbox = entity.getComponent(BoundingBox);
    // const rigidBody = entity.getComponent(RigidBody);

    colliders.forEach((collider) => {
      if (collider.uuid === entity.uuid) {
        return;
      }

      if (bbox.intersectBox(collider.getComponent(BoundingBox))) {
        // console.log('colliding', entity.type, collider.type);
        // rigidBody.velocityModifier.multiplyScalar(0);
      }
    });
  }

  public collideWithMap(entity: Entity, step: Vector2, delta: number): void {
    const position = entity.getComponent(Position);
    const rigidBody = entity.getComponent(RigidBody);
    const bbox = entity.getComponent(BoundingBox);
    const movement = entity.getComponent(Movement);

    const w = bbox?.width ?? 0;
    const h = bbox?.height ?? 0;

    const x1 = position.previousValue.x - w / 2;
    const x2 = position.previousValue.x + w / 2;
    let y1 = position.previousValue.y - h / 2;
    let y2 = position.previousValue.y + h / 2;

    const tileSize = this.world.tileMap.getTileSize();

    if (rigidBody.collide) {
      if (step.y > 0) {
        // top side collision
        const tile = this.testForCollision(this.world.tileMap, x1, y2 + step.y, x1 + w / 2, y2 + step.y, x2, y2 + step.y);
        if (tile) {
          position.y = tile.position.y - h / 2 - 0.01;
          this.handleCollisionWithBottomSide(entity, tile, delta);
        }
        if (movement) {
          movement.isBlockedDown = !!tile;
        }
      } else if (step.y < 0) {
        // bottom side collision
        const tile = this.testForCollision(this.world.tileMap, x1, y1 + step.y, x1 + w / 2, y1 + step.y, x2, y1 + step.y);

        if (tile) {
          position.y = tile.position.y + tileSize + h / 2 + 0.01;
          this.handleCollisionWithTopSide(entity, tile, delta);
        }
        if (movement) {
          movement.isBlockedUp = !!tile;
        }
      }

      /**
       * Fix corner collision bug when you get stuck - use newly computed y position to better estimate left/right side collisions
       */
      y1 = position.y - h / 2;
      y2 = position.y + h / 2;

      if (step.x > 0) {
        // left side collision
        const tile = this.testForCollision(this.world.tileMap, x2 + step.x, y1, x2 + step.x, y1 + h / 2, x2 + step.x, y2);

        if (tile) {
          position.x = tile.position.x - w / 2 - 0.01;
          this.handleCollisionWithLeftSide(entity, tile, delta);
        }
        if (movement) {
          movement.isBlockedRight = !!tile;
        }
      } else if (step.x < 0) {
        // right side collision
        const tile = this.testForCollision(this.world.tileMap, x1 + step.x, y1, x1 + step.x, y1 + h / 2, x1 + step.x, y2);

        if (tile) {
          position.x = tile.position.x + tileSize + w / 2 + 0.01;
          this.handleCollisionWithRightSide(entity, tile, delta);
        }
        if (movement) {
          movement.isBlockedLeft = !!tile;
        }
      }
    }
  }

  public isOnSolidTile(entity: Entity): boolean {
    const position = entity.getComponent(Position);
    const bbox = entity.getComponent(BoundingBox);

    const w = bbox?.width ?? 0;

    const x1 = bbox?.x1 ?? position.x;
    const x2 = x1 + w / 2;
    const x3 = bbox?.x2 ?? position.x;
    const y = (bbox?.y2 ?? position.y) + 0.01;

    const tile = this.testForCollision(this.world.tileMap, x1, y, x2, y, x3, y);

    return tile !== undefined;
  }

  protected testForCollision(tileMap: TileMap, a1x: number, a1y: number, b1x: number, b1y: number, c1x: number, c1y: number): ITile | undefined {
    const a = tileMap.getTileAtCoords(a1x, a1y);
    if (a && a.hasCollision()) {
      return a;
    }

    const b = tileMap.getTileAtCoords(b1x, b1y);
    if (b && b.hasCollision()) {
      return b;
    }

    const c = tileMap.getTileAtCoords(c1x, c1y);
    if (c && c.hasCollision()) {
      return c;
    }

    return undefined;
  }
}
