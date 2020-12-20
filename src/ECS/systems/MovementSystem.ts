import { System } from "@src/ECS";

import { Movement, Health, PlayerInput, Position, BoundingBox, RigidBody } from "@src/ECS/components";

export class MovementSystem extends System {
  public constructor() {
    super([
      Position.COMPONENT_TYPE,
      RigidBody.COMPONENT_TYPE,
      Movement.COMPONENT_TYPE,
      PlayerInput.COMPONENT_TYPE,
      Health.COMPONENT_TYPE,
      BoundingBox.COMPONENT_TYPE
    ]);
  }

  execute(delta: number): void {
    const entities = this.world.getEntities(this.componentTypes);
    if (entities.length === 0) {
      return;
    }

    entities.forEach((entity) => {
      const position = entity.getComponent(Position);
      const bbox = entity.getComponent(BoundingBox);
      const movement = entity.getComponent(Movement);
      const rigidBody = entity.getComponent(RigidBody);
      const input = entity.getComponent(PlayerInput);
      const health = entity.getComponent(Health);

      if (health.isAlive) {
        // handle jumping
        if (input.up && !movement.falling) {
          if (!movement.jumping && movement.isGrounded) {
            movement.jumping = true;
            rigidBody.velocity.y = -movement.initialJumpBoost; // initial boost

            if (movement.jumpSFX) {
              movement.jumpSFX.play();
            }

            this.world.playEffectOnceAt("dust_jump_effect", { x: position.x, y: position.y + bbox.height / 2 });
            movement.lastEffectTime = window.performance.now() + 350;
          } else {
            rigidBody.velocity.y += -movement.jumpSpeed * delta; // maintain momentum
          }
        } else {
          movement.jumping = false;
        }

        // handle moving
        if (input.right || input.left) {
          rigidBody.velocity.x += movement.acceleration;
          if (rigidBody.velocity.x > movement.speed) {
            rigidBody.velocity.x = movement.speed;
          }
        } else {
          if (rigidBody.velocity.x > 0) {
            rigidBody.velocity.x -= movement.deceleration;
            if (rigidBody.velocity.x < 0) {
              rigidBody.velocity.x = 0;
            }
          }
        }
      }

      // register direction change
      if (input.left) {
        rigidBody.direction.x = -1;
      } else if (input.right) {
        rigidBody.direction.x = 1;
      }

      // register orientation change
      if (input.aim.x < 0) {
        rigidBody.orientation.x = -1;
      } else if (input.aim.x > 0) {
        rigidBody.orientation.x = 1;
      }

      
      // apply movement trailing effects and update states
      const now = window.performance.now();
      
      if (movement.falling && rigidBody.previousVelocity.y === 0 && rigidBody.velocity.y > 0) {
        this.world.playEffectOnceAt("dust_land_effect", { x: position.x, y: position.y + (bbox?.height || 0) / 2 });
        movement.lastEffectTime = now + 500;
      }

      movement.falling = rigidBody.velocity.y > 0;
      movement.walking = rigidBody.velocity.y === 0 && Math.abs(rigidBody.velocity.x) > 0;
      movement.isGrounded = rigidBody.velocity.y === 0;
      movement.idle = rigidBody.velocity.y === 0 && rigidBody.velocity.x === 0;

      if (movement.walking && Math.abs(rigidBody.velocity.x) >= movement.speed && movement.isGrounded && (!movement.lastEffectTime || now > movement.lastEffectTime)) {
        movement.lastEffectTime = now + 250;
        this.world.playEffectOnceAt("dust_accelerate_effect", { x: position.x, y: position.y + (bbox?.height || 0) / 2 }, { x: rigidBody.direction.x * -1, y: 1 });
      }
    });
  }
}
