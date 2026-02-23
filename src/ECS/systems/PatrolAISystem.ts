import { Entity, System } from "@src/ECS";
import { RigidBody, Position, Health, PatrolAI, Movement, BoundingBox, Collider } from "@src/ECS/components";
import { PhysicsSystem } from "./PhysicsSystem";

export class PatrolAISystem extends System {
  public constructor() {
    super([PatrolAI.COMPONENT_TYPE, Position.COMPONENT_TYPE, RigidBody.COMPONENT_TYPE, Movement.COMPONENT_TYPE]);
  }

  public isNearingEdge(entity: Entity, dx: number, colliders: readonly Entity[]): boolean {
    const position = entity.getComponent(Position);
    const bbox = entity.getComponent(BoundingBox);
    const movement = entity.getComponent(Movement);
    const patrol = entity.getComponent(PatrolAI);

    if (dx > 0 && movement.isBlockedRight) {
      return true;
    }

    if (dx < 0 && movement.isBlockedLeft) {
      return true;
    }

    const probeX = position.x + dx * (bbox.width / 2 + patrol.probeDistance);
    const probeY = position.y + bbox.height / 2 + 0.01;

    const isOnSolidTile = this.world.tileMap.hasCollisionAtCoords(probeX, probeY);

    if (isOnSolidTile) {
      return false;
    }

    return !PhysicsSystem.isOnSolidColliderAtPoint(entity, probeX, probeY, colliders);
  }

  execute(delta: number): void {
    const entities = this.world.getEntities(this.componentTypes);
    if (entities.length === 0) {
      return;
    }

    entities.forEach((entity) => {
      const health = entity.getComponent(Health);
      const movement = entity.getComponent(Movement);
      const rigidBody = entity.getComponent(RigidBody);

      if (health && health.isDead) {
        return;
      }

      const colliders = this.world.getEntities([Position.COMPONENT_TYPE, BoundingBox.COMPONENT_TYPE, Collider.COMPONENT_TYPE]);

      let dx = rigidBody.direction.x;

      if (this.isNearingEdge(entity, dx, colliders)) {
        dx *= -1;
      }

      rigidBody.direction.x = dx;
      rigidBody.orientation.x = dx;

      rigidBody.velocity.x += rigidBody.direction.x * movement.acceleration * delta;
      rigidBody.velocity.x = Math.max(-movement.speed, Math.min(movement.speed, rigidBody.velocity.x));

      const falling = !rigidBody.isGrounded && !movement.dashing && !movement.wallClimbing && !movement.wallSliding && rigidBody.velocity.y > 0;

      if (falling) {
        rigidBody.gravityScale = rigidBody.defaultGravityScale * movement.fallGravityMultiplier;
      } else {
        if (rigidBody.gravityScale > 0) {
          rigidBody.gravityScale = rigidBody.defaultGravityScale;
        }
      }

      movement.landing = false;
      movement.walking = rigidBody.isGrounded && Math.abs(rigidBody.velocity.x) > Number.EPSILON;
      movement.falling = falling;
      movement.idle = rigidBody.isGrounded && !movement.walking;

      movement.wasGrounded = rigidBody.isGrounded;
    });
  }
}
