import { Entity, System } from "@src/ECS";
import { Collider, Position, BoundingBox, RigidBody, Movement } from "@src/ECS/components";

import { ITile } from "@src/shared/models/tilemap.model";
import Vector2 from "@src/shared/math/Vector2";

import World from "@src/world/World";
import TileMap from "@src/world/TileMap";

export class PhysicsSystem extends System {
  public constructor() {
    super([Position.COMPONENT_TYPE, RigidBody.COMPONENT_TYPE, BoundingBox.COMPONENT_TYPE]);
  }

  public addedToWorld(world: World): void {
    super.addedToWorld(world);

    world.entityAdded$([Position.COMPONENT_TYPE, RigidBody.COMPONENT_TYPE, BoundingBox.COMPONENT_TYPE]).subscribe((entity) => {
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

    entities.forEach((entity) => {
      const position = entity.getComponent(Position);
      const bbox = entity.getComponent(BoundingBox);
      const rigidBody = entity.getComponent(RigidBody);
      const movement = entity.getComponent(Movement);

      // save previous velocity/pos for later
      position.previousValue.copy(position);
      rigidBody.previousVelocity.copy(rigidBody.velocity);

      // apply gravity
      if (rigidBody.gravity) {
        rigidBody.velocity.y += this.world.gravity * delta;

        if (rigidBody.maxFallSpeed > 0 && rigidBody.velocity.y > rigidBody.maxFallSpeed) {
          rigidBody.velocity.y = rigidBody.maxFallSpeed;
        }
      }

      // we move one step
      const step = Vector2.create(rigidBody.velocity.x, rigidBody.velocity.y).multiply(rigidBody.velocityModifier).multiplyScalar(delta);
      position.add(step);

      if (movement) {
        movement.isBlockedLeft = false;
        movement.isBlockedRight = false;
        movement.isBlockedUp = false;
        movement.isBlockedDown = false;
      }

      const colliders = this.world.getEntities([Position.COMPONENT_TYPE, BoundingBox.COMPONENT_TYPE, Collider.COMPONENT_TYPE]);

      if (entity.hasComponent(BoundingBox.COMPONENT_TYPE)) {
        this.collideWithBoundingBox(entity, colliders, step, delta);
      }

      this.collideWithMap(entity, step, delta);

      if (rigidBody.clampToMap) {
        this.clampToMap(entity, delta);
      }

      // sync bbox position
      if (bbox) {
        bbox.setPositionFromVector2(position);
      }

      if (rigidBody.reflectAngle) {
        const vx = rigidBody.velocity.x * rigidBody.velocityModifier.x;
        const vy = rigidBody.velocity.y * rigidBody.velocityModifier.y;

        // avoid noisy rotation when almost stopped
        const speed = Math.hypot(vx, vy);
        if (speed > Number.EPSILON) {
          position.rotation = Math.atan2(vy, vx);
        }
      }

      rigidBody.isGrounded = this.isOnSolidTile(entity) || this.isOnSolidCollider(entity, colliders);

      Vector2.destroy(step);
    });
  }

  public clampToMap(entity: Entity, _delta: number): void {
    const position = entity.getComponent(Position);
    const rigidBody = entity.getComponent(RigidBody);
    const bbox = entity.getComponent(BoundingBox);

    const boundaries = this.world.tileMap.getBoundaries();

    const w = bbox?.width ?? 0;
    const h = bbox?.height ?? 0;
    const halfW = w / 2;
    const halfH = h / 2;

    const x1 = boundaries.x1 + halfW;
    const x2 = boundaries.x2 - halfW;
    const y1 = boundaries.y1 + halfH;
    const y2 = boundaries.y2 - halfH;

    let x = position.x;
    let y = position.y;

    if (position.x < x1) {
      x = x1;
      rigidBody.velocity.x = 0;
      rigidBody.velocity.y = 0;
    }
    if (position.y < y1) {
      y = y1;
      rigidBody.velocity.x = 0;
      rigidBody.velocity.y = 0;
    }
    if (position.x > x2) {
      x = x2;
      rigidBody.velocity.x = 0;
      rigidBody.velocity.y = 0;
    }
    if (position.y > y2) {
      y = y2;
      rigidBody.velocity.x = 0;
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

      if (rigidBody.velocity.y > 0) {
        rigidBody.velocity.y -= 8 * delta;
        if (rigidBody.velocity.y < 0) {
          rigidBody.velocity.y = 0;
        }
      }

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

      if (rigidBody.velocity.y > 0) {
        rigidBody.velocity.y -= 8 * delta;
        if (rigidBody.velocity.y < 0) {
          rigidBody.velocity.y = 0;
        }
      }

      Vector2.destroy(n);

      if (rigidBody.reflectVFX) {
        this.world.playEffectOnceAt(rigidBody.reflectVFX, { x: bbox.x2, y: position.y });
      }
    } else {
      rigidBody.velocity.x = 0;
    }
  }
  private overlaps(a1: number, a2: number, b1: number, b2: number): boolean {
    return a1 < b2 && a2 > b1;
  }

  public collideWithBoundingBox(entity: Entity, colliders: readonly Entity[], _step: Vector2, delta: number): void {
    const position = entity.getComponent(Position);
    const rigidBody = entity.getComponent(RigidBody);
    const bbox = entity.getComponent(BoundingBox);
    const collider = entity.getComponent(Collider);
    const movement = entity.hasComponent(Movement.COMPONENT_TYPE) ? entity.getComponent(Movement) : null;

    if (!rigidBody.collide) return;

    const w = bbox.width;
    const h = bbox.height;
    const halfW = w / 2;
    const halfH = h / 2;
    const eps = 0.01;

    // IMPORTANT: use actual displacement (position may have been corrected by collideWithMap)
    const dx = position.x - position.previousValue.x;
    const dy = position.y - position.previousValue.y;

    // Helpers to read entity AABB from center position
    const aabbAt = (cx: number, cy: number) => ({
      x1: cx - halfW,
      x2: cx + halfW,
      y1: cy - halfH,
      y2: cy + halfH,
    });

    // -------------------------
    // 1) Resolve Y (like map)
    // -------------------------
    if (dy !== 0) {
      const prev = aabbAt(position.previousValue.x, position.previousValue.y);
      const cur = aabbAt(position.x, position.y);

      let hit: BoundingBox | null = null;

      if (dy > 0) {
        // moving DOWN: bottom crosses collider top (collider.y1)
        // choose nearest => smallest collider.y1 in [prevBottom, curBottom]
        let bestY1 = Number.POSITIVE_INFINITY;

        for (const c of colliders) {
          if (c.uuid === entity.uuid) continue;

          const cc = c.getComponent(Collider);
          if (cc.isExcluded(entity) || collider?.isExcluded(c)) continue;

          const cPos = c.getComponent(Position);
          const cBox = c.getComponent(BoundingBox);

          // make sure collider bbox is in sync (cheap and avoids stale values)
          cBox.setPositionFromVector2(cPos);

          if (!this.overlaps(cur.x1, cur.x2, cBox.x1, cBox.x2)) continue;

          const prevBottom = prev.y2;
          const curBottom = cur.y2;

          if (prevBottom <= cBox.y1 && curBottom >= cBox.y1) {
            if (cBox.y1 < bestY1) {
              bestY1 = cBox.y1;
              hit = cBox;
            }
          }
        }

        if (hit) {
          position.y = hit.y1 - halfH - eps;
          this.handleCollisionWithBottomSide(entity, hit, delta);
          if (movement) movement.isBlockedDown = true;
        }
      } else {
        // moving UP: top crosses collider bottom (collider.y2)
        // choose nearest => largest collider.y2 in [curTop, prevTop]
        let bestY2 = Number.NEGATIVE_INFINITY;

        for (const c of colliders) {
          if (c.uuid === entity.uuid) continue;

          const cc = c.getComponent(Collider);
          if (cc.isExcluded(entity) || collider?.isExcluded(c)) continue;

          const cPos = c.getComponent(Position);
          const cBox = c.getComponent(BoundingBox);
          cBox.setPositionFromVector2(cPos);

          if (!this.overlaps(cur.x1, cur.x2, cBox.x1, cBox.x2)) continue;

          const prevTop = prev.y1;
          const curTop = cur.y1;

          if (prevTop >= cBox.y2 && curTop <= cBox.y2) {
            if (cBox.y2 > bestY2) {
              bestY2 = cBox.y2;
              hit = cBox;
            }
          }
        }

        if (hit) {
          position.y = hit.y2 + halfH + eps;
          this.handleCollisionWithTopSide(entity, hit, delta);
          if (movement) movement.isBlockedUp = true;
        }
      }
    }

    // -------------------------
    // 2) Resolve X (like map)
    // -------------------------
    if (dx !== 0) {
      const prev = aabbAt(position.previousValue.x, position.previousValue.y);
      const cur = aabbAt(position.x, position.y); // uses y possibly corrected above

      let hit: BoundingBox | null = null;

      if (dx > 0) {
        // moving RIGHT: right crosses collider left (collider.x1)
        // choose nearest => smallest collider.x1 in [prevRight, curRight]
        let bestX1 = Number.POSITIVE_INFINITY;

        for (const c of colliders) {
          if (c.uuid === entity.uuid) continue;

          const cc = c.getComponent(Collider);
          if (cc.isExcluded(entity) || collider?.isExcluded(c)) continue;

          const cPos = c.getComponent(Position);
          const cBox = c.getComponent(BoundingBox);
          cBox.setPositionFromVector2(cPos);

          if (!this.overlaps(cur.y1, cur.y2, cBox.y1, cBox.y2)) continue;

          const prevRight = prev.x2;
          const curRight = cur.x2;

          if (prevRight <= cBox.x1 && curRight >= cBox.x1) {
            if (cBox.x1 < bestX1) {
              bestX1 = cBox.x1;
              hit = cBox;
            }
          }
        }

        if (hit) {
          position.x = hit.x1 - halfW - eps;
          // keep same convention as collideWithMap: moving right -> handleCollisionWithLeftSide
          this.handleCollisionWithLeftSide(entity, hit, delta);
          if (movement) movement.isBlockedRight = true;
        }
      } else {
        // moving LEFT: left crosses collider right (collider.x2)
        // choose nearest => largest collider.x2 in [curLeft, prevLeft]
        let bestX2 = Number.NEGATIVE_INFINITY;

        for (const c of colliders) {
          if (c.uuid === entity.uuid) continue;

          const cc = c.getComponent(Collider);
          if (cc.isExcluded(entity) || collider?.isExcluded(c)) continue;

          const cPos = c.getComponent(Position);
          const cBox = c.getComponent(BoundingBox);
          cBox.setPositionFromVector2(cPos);

          if (!this.overlaps(cur.y1, cur.y2, cBox.y1, cBox.y2)) continue;

          const prevLeft = prev.x1;
          const curLeft = cur.x1;

          if (prevLeft >= cBox.x2 && curLeft <= cBox.x2) {
            if (cBox.x2 > bestX2) {
              bestX2 = cBox.x2;
              hit = cBox;
            }
          }
        }

        if (hit) {
          position.x = hit.x2 + halfW + eps;
          // keep same convention as collideWithMap: moving left -> handleCollisionWithRightSide
          this.handleCollisionWithRightSide(entity, hit, delta);
          if (movement) movement.isBlockedLeft = true;
        }
      }
    }
  }

  public collideWithMap(entity: Entity, step: Vector2, delta: number): void {
    const position = entity.getComponent(Position);
    const rigidBody = entity.getComponent(RigidBody);
    const bbox = entity.getComponent(BoundingBox);
    const movement = entity.getComponent(Movement);

    const w = bbox?.width ?? 0;
    const h = bbox?.height ?? 0;
    const halfW = w / 2;
    const halfH = h / 2;

    const x1 = position.previousValue.x - halfW;
    const x2 = position.previousValue.x + halfW;
    let y1 = position.previousValue.y - halfH;
    let y2 = position.previousValue.y + halfH;

    const tileSize = this.world.tileMap.getTileSize();

    if (rigidBody.collide) {
      if (step.y > 0) {
        // top side collision
        const tile = this.testForCollision(this.world.tileMap, x1, y2 + step.y, x1 + halfW, y2 + step.y, x2, y2 + step.y);
        if (tile) {
          position.y = tile.position.y - halfH - 0.01;
          this.handleCollisionWithBottomSide(entity, tile, delta);
        }
        if (movement && !!tile) {
          movement.isBlockedDown = true;
        }
      } else if (step.y < 0) {
        // bottom side collision
        const tile = this.testForCollision(this.world.tileMap, x1, y1 + step.y, x1 + halfW, y1 + step.y, x2, y1 + step.y);

        if (tile) {
          position.y = tile.position.y + tileSize + halfH + 0.01;
          this.handleCollisionWithTopSide(entity, tile, delta);
        }
        if (movement && !!tile) {
          movement.isBlockedUp = true;
        }
      }

      /**
       * Fix corner collision bug when you get stuck - use newly computed y position to better estimate left/right side collisions
       */
      y1 = position.y - halfH;
      y2 = position.y + halfH;

      if (step.x > 0) {
        // left side collision
        const tile = this.testForCollision(this.world.tileMap, x2 + step.x, y1, x2 + step.x, y1 + halfH, x2 + step.x, y2);

        if (tile) {
          position.x = tile.position.x - halfW - 0.01;
          this.handleCollisionWithLeftSide(entity, tile, delta);
        }
        if (movement && !!tile) {
          movement.isBlockedRight = true;
        }
      } else if (step.x < 0) {
        // right side collision
        const tile = this.testForCollision(this.world.tileMap, x1 + step.x, y1, x1 + step.x, y1 + halfH, x1 + step.x, y2);

        if (tile) {
          position.x = tile.position.x + tileSize + halfW + 0.01;
          this.handleCollisionWithRightSide(entity, tile, delta);
        }
        if (movement && !!tile) {
          movement.isBlockedLeft = true;
        }
      }
    }
  }

  private isOnSolidCollider(entity: Entity, colliders: readonly Entity[]): boolean {
    const rb = entity.getComponent(RigidBody);
    const collider = entity.getComponent(Collider);
    const bbox = entity.getComponent(BoundingBox);

    if (rb.velocity.y < 0) return false; // not moving upward

    for (const c of colliders) {
      if (c.uuid === entity.uuid) continue;

      const cc = c.getComponent(Collider);
      if (cc.isExcluded(entity) || collider?.isExcluded(c)) continue;

      const colliderPosition = c.getComponent(Position);
      const colliderBbox = c.getComponent(BoundingBox);
      colliderBbox.setPositionFromVector2(colliderPosition);

      const closeEnough = Math.abs(colliderBbox.y1 - bbox.y2) <= 0.5;
      const xOverlap = bbox.x1 < colliderBbox.x2 && bbox.x2 > colliderBbox.x1;

      if (closeEnough && xOverlap) return true;
    }

    return false;
  }

  public isOnSolidTile(entity: Entity): boolean {
    const position = entity.getComponent(Position);
    const bbox = entity.getComponent(BoundingBox);

    const w = bbox?.width ?? 0;
    const halfW = w / 2;

    const x1 = bbox?.x1 ?? position.x;
    const x2 = x1 + halfW;
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
