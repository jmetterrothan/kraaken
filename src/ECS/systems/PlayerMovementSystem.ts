import { RIGID_BODY_COMPONENT, PLAYER_MOVEMENT_COMPONENT, PLAYER_INPUT_COMPONENT } from "@src/ECS/types";
import { System } from "@src/ECS";
import { PlayerMovement, PlayerInput, RigidBody } from "@src/ECS/components";

export class PlayerMovementSystem extends System {
  public constructor() {
    super([RIGID_BODY_COMPONENT, PLAYER_MOVEMENT_COMPONENT, PLAYER_INPUT_COMPONENT]);
  }

  execute(delta: number): void {
    const entities = this.world.getEntities(this.componentTypes);
    if (entities.length === 0) {
      return;
    }

    entities.forEach((entity) => {
      const rigidBody = entity.getComponent<RigidBody>(RIGID_BODY_COMPONENT);
      const input = entity.getComponent<PlayerInput>(PLAYER_INPUT_COMPONENT);
      const movement = entity.getComponent<PlayerMovement>(PLAYER_MOVEMENT_COMPONENT);

      // register direction change
      if (input.left) {
        rigidBody.direction.x = -1;
      } else if (input.right) {
        rigidBody.direction.x = 1;
      }

      // handle jumping
      if (input.up && !movement.falling) {
        if (!movement.jumping && movement.isGrounded) {
          movement.jumping = true;
          rigidBody.velocity.y = -movement.initialJumpBoost; // initial boost
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
    });
  }
}
