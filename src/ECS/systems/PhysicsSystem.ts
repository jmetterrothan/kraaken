import Entity from "@src/ECS/Entity";
import System from "@src/ECS/System";

import { Position, BoundingBox, RigidBody, PlayerMovement } from "@src/ECS/components";
import { POSITION_COMPONENT, PLAYER_MOVEMENT_COMPONENT, BOUNDING_BOX_COMPONENT, RIGID_BODY_COMPONENT } from "@src/ECS/types";

import { ITile } from '@shared/models/tilemap.model';

import TileMap from "@src/world/TileMap";

import Vector2 from "@shared/math/Vector2";

export class PhysicsSystem extends System {
  public constructor() {
    super([POSITION_COMPONENT, RIGID_BODY_COMPONENT]);
  }

  execute(delta: number): void {
    const entities = this.world.getEntities(this.componentTypes);
    if (entities.length === 0) {
      return;
    }

    entities.forEach((entity) => {
      const position = entity.getComponent<Position>(POSITION_COMPONENT);
      const rigidBody = entity.getComponent<RigidBody>(RIGID_BODY_COMPONENT);

      position.previousValue.copy(position);

      if (rigidBody.gravity) {
        // gravity
        rigidBody.velocity.y += this.world.gravity * delta;

        if (rigidBody.velocity.y > this.world.gravity) {
          rigidBody.velocity.y = this.world.gravity;
        }
      }

      this.collideWithMap(entity, delta);

      if (rigidBody.clamToMap) {
        this.clampToMap(entity);
      }
    });
  }

  public clampToMap(entity: Entity): void {
    const position = entity.getComponent<Position>(POSITION_COMPONENT);
    const rigidBody = entity.getComponent<RigidBody>(RIGID_BODY_COMPONENT);
    const bbox = entity.getComponent<BoundingBox>(BOUNDING_BOX_COMPONENT);

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

  public collideWithMap(entity: Entity, delta: number): void {
    const position = entity.getComponent<Position>(POSITION_COMPONENT);
    const rigidBody = entity.getComponent<RigidBody>(RIGID_BODY_COMPONENT);
    const bbox = entity.getComponent<BoundingBox>(BOUNDING_BOX_COMPONENT);

    const v = rigidBody.velocity.clone().multiply(rigidBody.direction).multiplyScalar(delta);
    const newPosition = position.clone().add(v);

    if (bbox) {
      bbox.setPositionFromVector2(position);
    }

    const x1 = bbox?.x1 ?? position.x;
    const y1 = bbox?.y1 ?? position.y;
    const x2 = bbox?.x2 ?? position.x;
    const y2 = bbox?.y2 ?? position.y;

    const w = bbox?.width ?? 0;
    const h = bbox?.height ?? 0;

    if (rigidBody.collide) {
      if (v.y > 0) {
        // bottom collision
        const tile = this.testForCollision(this.world.tileMap, x1, y2 + v.y, x1 + w / 2, y2 + v.y, x2, y2 + v.y);
        if (tile) {
          newPosition.y = tile.position.y - h / 2 - 0.01;

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
              this.world.playEffectOnceAt(rigidBody.reflectVFX, { x: position.x, y: tile.y1 });
            }
          } else {
            rigidBody.velocity.y = 0;
          }
        }
      } else if (v.y < 0) {
        // top collision
        const tile = this.testForCollision(this.world.tileMap, x1, y1 + v.y, x1 + w / 2, y1 + v.y, x2, y1 + v.y);

        if (tile) {
          newPosition.y = tile.position.y + this.world.tileMap.getTileSize() + h / 2 + 0.01;

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
              this.world.playEffectOnceAt(rigidBody.reflectVFX, { x: position.x, y: tile.y2 });
            }
          } else {
            rigidBody.velocity.y = 0;
          }
        }
      }

      if (v.x > 0) {
        // right collision
        const tile = this.testForCollision(this.world.tileMap, x2 + v.x, y1, x2 + v.x, y1 + h / 2, x2 + v.x, y2);

        if (tile) {
          newPosition.x = tile.position.x - w / 2 - 0.01;

          if (rigidBody.reflect) {
            const n = Vector2.create(1, 0);
            const r = rigidBody.velocity.reflect(n);
            if (rigidBody.reflectAngle) {
              position.rotation = Math.atan2(r.y, r.x);
            } 
            rigidBody.velocity.fromValues(r.x, r.y).multiplyScalar(rigidBody.bounciness);

            Vector2.destroy(n);

            if (rigidBody.reflectVFX) {
              this.world.playEffectOnceAt(rigidBody.reflectVFX, { x: tile.x1, y: position.y });
            }
          } else {
            rigidBody.velocity.x = 0;
          }
        }
      } else if (v.x < 0) {
        // left collision
        const tile = this.testForCollision(this.world.tileMap, x1 + v.x, y1, x1 + v.x, y1 + h / 2, x1 + v.x, y2);

        if (tile) {
          newPosition.x = tile.position.x + this.world.tileMap.getTileSize() + w / 2 + 0.01;

          if (rigidBody.reflect) {
            const n = Vector2.create(-1, 0);
            const r = rigidBody.velocity.reflect(n);
            if (rigidBody.reflectAngle) {
              position.rotation = Math.atan2(r.y, r.x);
            }
            rigidBody.velocity.fromValues(r.x, r.y).multiplyScalar(rigidBody.bounciness);

            Vector2.destroy(n);

            if (rigidBody.reflectVFX) {
              this.world.playEffectOnceAt(rigidBody.reflectVFX, { x: tile.x2, y: position.y });
            }
          } else {
            rigidBody.velocity.x = 0;
          }
        }
      }
    }

    position.fromValues(newPosition.x, newPosition.y);
    Vector2.destroy(newPosition);

    const now = window.performance.now();
    
    if (entity.hasComponent(PLAYER_MOVEMENT_COMPONENT)) {
      const movement = entity.getComponent<PlayerMovement>(PLAYER_MOVEMENT_COMPONENT);
      
      if (movement.falling && rigidBody.velocity.y === 0 && v.y > 0) {
        this.world.playEffectOnceAt("dust_land_effect", { x: position.x, y: position.y + (bbox?.height || 0) / 2 });
        movement.lastEffectTime = now + 500;
      }

      const isOnSolidTile = this.isOnSolidTile(entity);
      movement.falling = rigidBody.velocity.y > 0;
      movement.walking = Math.abs(rigidBody.velocity.x) > 0;
      movement.isGrounded = isOnSolidTile;
      movement.idle = rigidBody.velocity.x === 0;

      if (movement.walking && Math.abs(rigidBody.velocity.x) >= movement.speed && movement.isGrounded && (!movement.lastEffectTime || now > movement.lastEffectTime)) {
        movement.lastEffectTime = now + 250;
        this.world.playEffectOnceAt("dust_accelerate_effect", { x: position.x, y: position.y + (bbox?.height || 0) / 2 }, { x: rigidBody.direction.x * -1, y: 1 });
      }
    }
  }

  public isOnSolidTile(entity: Entity): boolean {
    const position = entity.getComponent<Position>(POSITION_COMPONENT);
    const bbox = entity.getComponent<BoundingBox>(BOUNDING_BOX_COMPONENT);

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
