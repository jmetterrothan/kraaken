import { System } from "@src/ECS";

import { Movement, PlayerInput, Position, BoundingBox, RigidBody } from "@src/ECS/components";

export class MovementSystem extends System {
  public constructor() {
    super([Position.COMPONENT_TYPE, RigidBody.COMPONENT_TYPE, Movement.COMPONENT_TYPE, PlayerInput.COMPONENT_TYPE, BoundingBox.COMPONENT_TYPE]);
  }

  execute(delta: number): void {
    const entities = this.world.getEntities(this.componentTypes);
    if (entities.length === 0) {
      return;
    }

    entities.forEach((entity) => {
      const now = window.performance.now();

      const position = entity.getComponent(Position);
      const bbox = entity.getComponent(BoundingBox);
      const movement = entity.getComponent(Movement);
      const rigidBody = entity.getComponent(RigidBody);
      const input = entity.getComponent(PlayerInput);

      // handle jumping
      if (input.up && !movement.falling && !movement.wallSliding) {
        if (!movement.jumping && rigidBody.isGrounded) {
          movement.jumping = true;
          rigidBody.velocity.y = -movement.initialJumpBoost; // initial boost

          if (movement.jumpSFX) {
            movement.jumpSFX.play();
          }

          this.world.playEffectOnceAt("dust_jump_effect", { x: position.x, y: position.y + bbox.height / 2 });
          movement.lastEffectTime = now + 350;
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

      if (movement.wallSliding) {
        rigidBody.velocity.y -= this.world.gravity * 0.5 * delta;

        if (rigidBody.velocity.y > 0) {
          rigidBody.velocity.y = 0;
        }
      }

      // cancel wallJumping
      if (movement.lastWallJumpTime + 350 < now) {
        movement.wallJumping = false;
      }

      if (movement.wallSliding && input.up && movement.lastWallJumpTime + 750 < now) {
        rigidBody.velocity.y += -movement.initialJumpBoost * 0.8;

        movement.wallJumping = true;
        movement.lastWallJumpTime = now;

        if (!movement.jumping) {
          if (movement.jumpSFX) {
            movement.jumpSFX.play();
          }

          this.world.playEffectOnceAt("dust_hit_effect", { x: position.x + rigidBody.direction.x * (bbox.width / 2), y: position.y - bbox.height / 2 });
          movement.lastEffectTime = now + 350;
        }
      }

      // apply movement trailing effects and update states
      if (movement.falling && rigidBody.previousVelocity.y === 0 && rigidBody.velocity.y > 0) {
        this.world.playEffectOnceAt("dust_land_effect", { x: position.x, y: position.y + (bbox?.height || 0) / 2 });
        movement.lastEffectTime = now + 500;
      }

      movement.falling = rigidBody.velocity.y > 0;
      movement.walking = rigidBody.velocity.y === 0 && Math.abs(rigidBody.velocity.x) > 0;
      movement.idle = rigidBody.velocity.y === 0 && rigidBody.velocity.x === 0;
      movement.wallSliding = !movement.jumping && !rigidBody.isGrounded && ((input.right && movement.isBlockedRight) || (input.left && movement.isBlockedLeft));

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

      // lock direction/orientation when wallSliding
      if (movement.wallSliding && input.right && movement.isBlockedRight) {
        rigidBody.direction.x = 1;
        rigidBody.orientation.x = 1;
      }

      if (movement.wallSliding && input.left && movement.isBlockedLeft) {
        rigidBody.direction.x = -1;
        rigidBody.orientation.x = -1;
      }

      if (movement.walking && Math.abs(rigidBody.velocity.x) >= movement.speed && rigidBody.isGrounded && (!movement.lastEffectTime || now > movement.lastEffectTime)) {
        movement.lastEffectTime = now + 250;
        this.world.playEffectOnceAt("dust_accelerate_effect", { x: position.x, y: position.y + (bbox?.height || 0) / 2 }, { x: rigidBody.direction.x * -1, y: 1 });
      }
    });
  }
}
