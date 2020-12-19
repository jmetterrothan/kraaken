import { Entity, System } from "@src/ECS";
import { Collider, Position, BoundingBox, RigidBody, Movement } from "@src/ECS/components";

import { ITile } from '@shared/models/tilemap.model';
import Vector2 from "@shared/math/Vector2";

import TileMap from "@src/world/TileMap";


export class PhysicsSystem extends System {
  public constructor() {
    super([
      Position.COMPONENT_TYPE,
      RigidBody.COMPONENT_TYPE
    ]);
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

      // save velocity for later
      const vy = rigidBody.velocity.y;
      // save previous pos
      position.previousValue.copy(position);
      // sync bbox position
      if (bbox) {
        bbox.setPositionFromVector2(position);
      }

      // apply gravity
      if (rigidBody.gravity) {
        rigidBody.velocity.y += this.world.gravity * delta;

        if (rigidBody.velocity.y > this.world.gravity) {
          rigidBody.velocity.y = this.world.gravity;
        }
      }

      const newVelocity = rigidBody.velocity.clone().multiply(rigidBody.direction).multiplyScalar(delta);
      const newPosition = position.clone().add(newVelocity);

      this.collideWithMap(entity, newPosition, newVelocity, delta);
      // this.collideWithBoundingBox(entity, colliders, newPosition, newVelocity, delta);

      position.fromValues(newPosition.x, newPosition.y);
      Vector2.destroy(newPosition);

      if (rigidBody.clamToMap) {
        this.clampToMap(entity);
      }

      // apply movement trailing effects and update states
      const now = window.performance.now();
    
      if (entity.hasComponent(Movement.COMPONENT_TYPE)) {
        const movement = entity.getComponent(Movement);
        
        if (movement.falling && vy === 0 && rigidBody.velocity.y > 0) {
          this.world.playEffectOnceAt("dust_land_effect", { x: position.x, y: position.y + (bbox?.height || 0) / 2 });
          movement.lastEffectTime = now + 500;
        }

        movement.falling = rigidBody.velocity.y > 0;
        movement.walking = Math.abs(rigidBody.velocity.x) > 0;
        movement.isGrounded = rigidBody.velocity.y === 0;
        movement.idle = rigidBody.velocity.x === 0;

        if (movement.walking && Math.abs(rigidBody.velocity.x) >= movement.speed && movement.isGrounded && (!movement.lastEffectTime || now > movement.lastEffectTime)) {
          movement.lastEffectTime = now + 250;
          this.world.playEffectOnceAt("dust_accelerate_effect", { x: position.x, y: position.y + (bbox?.height || 0) / 2 }, { x: rigidBody.direction.x * -1, y: 1 });
        }
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

  public collideWithBoundingBox(entity: Entity, colliders: readonly Entity[], newPosition: Vector2, newVelocity: Vector2, delta: number): void {
    
  }

  public collideWithMap(entity: Entity, newPosition: Vector2, newVelocity: Vector2, delta: number): void {
    const position = entity.getComponent(Position);
    const rigidBody = entity.getComponent(RigidBody);
    const bbox = entity.getComponent(BoundingBox);

    const x1 = bbox?.x1 ?? position.x;
    const y1 = bbox?.y1 ?? position.y;
    const x2 = bbox?.x2 ?? position.x;
    const y2 = bbox?.y2 ?? position.y;

    const w = bbox?.width ?? 0;
    const h = bbox?.height ?? 0;

    if (rigidBody.collide) {
      if (newVelocity.y > 0) {

        // top side collision
        const tile = this.testForCollision(this.world.tileMap, x1, y2 + newVelocity.y, x1 + w / 2, y2 + newVelocity.y, x2, y2 + newVelocity.y);
        if (tile) {
          newPosition.y = tile.position.y - h / 2 - 0.01;
          this.handleCollisionWithBottomSide(entity, tile, delta);
        }
      } else if (newVelocity.y < 0) {
        // bottom side collision
        const tile = this.testForCollision(this.world.tileMap, x1, y1 + newVelocity.y, x1 + w / 2, y1 + newVelocity.y, x2, y1 + newVelocity.y);

        if (tile) {
          newPosition.y = tile.position.y + this.world.tileMap.getTileSize() + h / 2 + 0.01;
          this.handleCollisionWithTopSide(entity, tile, delta);
        }
      }

      if (newVelocity.x > 0) {
        // left side collision
        const tile = this.testForCollision(this.world.tileMap, x2 + newVelocity.x, y1, x2 + newVelocity.x, y1 + h / 2, x2 + newVelocity.x, y2);

        if (tile) {
          newPosition.x = tile.position.x - w / 2 - 0.01;
          this.handleCollisionWithLeftSide(entity, tile, delta);
        }
      } else if (newVelocity.x < 0) {
        // right side collision
        const tile = this.testForCollision(this.world.tileMap, x1 + newVelocity.x, y1, x1 + newVelocity.x, y1 + h / 2, x1 + newVelocity.x, y2);
        
        if (tile) {
          newPosition.x = tile.position.x + this.world.tileMap.getTileSize() + w / 2 + 0.01;
          this.handleCollisionWithRightSide(entity, tile, delta);
        }
      }
    }
  }

  public isOnSolidTile(entity: Entity): boolean {
    const position = entity.getComponent(Position);
    const bbox = entity.getComponent(BoundingBox);

    const tileMap = this.world.tileMap;

    const w = bbox?.width ?? 0;
    const x1 = bbox?.x1 ?? position.x;
    const x2 = x1 + w / 2;
    const x3 = bbox?.x2 ?? position.x;
    const y = (bbox?.y2 ?? position.y) + 0.01;

    const tile = this.testForCollision(tileMap, x1, y, x2, y, x3, y);

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
