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

    const now = window.performance.now();

    entities.forEach((entity) => {
      const position = entity.getComponent(Position);
      const bbox = entity.getComponent(BoundingBox);
      const movement = entity.getComponent(Movement);
      const rigidBody = entity.getComponent(RigidBody);
      const input = entity.getComponent(PlayerInput);

      const grounded = rigidBody.isGrounded;

      const pressingIntoLeftWall = input.left && movement.isBlockedLeft;
      const pressingIntoRightWall = input.right && movement.isBlockedRight;

      const pressingIntoWall = pressingIntoLeftWall || pressingIntoRightWall;

      const dtMs = delta * 1000;

      const jumpDown = input.up;
      const jumpPressed = jumpDown && !movement.prevJumpDown;
      movement.prevJumpDown = jumpDown;

      // --- COYOTE TIME ---
      if (grounded) {
        movement.coyoteRemainingMs = movement.coyoteTimeMs;
      } else {
        movement.coyoteRemainingMs = Math.max(0, movement.coyoteRemainingMs - dtMs);
      }

      // --- JUMP BUFFER ---
      if (jumpPressed) {
        movement.jumpBufferRemainingMs = movement.jumpBufferMs;
      } else {
        movement.jumpBufferRemainingMs = Math.max(0, movement.jumpBufferRemainingMs - dtMs);
      }

      // --- CONSUME BUFFER IF WE CAN JUMP ---
      const canConsumeJump = movement.jumpBufferRemainingMs > 0 && movement.coyoteRemainingMs > 0 && !movement.wallSliding && !movement.wallClimbing; // optional: decide priority with wall climb

      if (canConsumeJump) {
        movement.jumpBufferRemainingMs = 0;
        movement.coyoteRemainingMs = 0;

        movement.jumping = true;
        rigidBody.isGrounded = false;

        rigidBody.velocity.y = -movement.initialJumpBoost;

        if (movement.jumpSFX || movement.jumpVFX) {
          if (movement.jumpSFX) {
            movement.jumpSFX.play();
          }

          if (movement.jumpVFX && movement.wasGrounded) {
            this.world.playEffectOnceAt(movement.jumpVFX, { x: position.x, y: position.y + bbox.height / 2 });
          }
          movement.lastEffectTime = now + 200;
        }
      }

      // --- VARIABLE JUMP (hold to go higher) ---
      if (movement.jumping) {
        if (jumpDown && rigidBody.velocity.y < 0 && !movement.wallClimbing) {
          rigidBody.velocity.y += -movement.jumpSpeed * delta; // your existing “maintain momentum”
        }

        // release-to-cut jump (optional but feels great)
        if (!jumpDown && rigidBody.velocity.y < 0) {
          rigidBody.velocity.y *= 0.5;
          movement.jumping = false;
        }

        // stop “jumping” state once you start falling
        if (rigidBody.velocity.y >= 0) {
          movement.jumping = false;
        }
      }

      // --- BASIC MOVEMENTS ---
      if (input.right || input.left) {
        const axis = (input.right ? 1 : 0) + (input.left ? -1 : 0);

        rigidBody.velocity.x += axis * movement.acceleration * delta;
        rigidBody.velocity.x = Math.max(-movement.speed, Math.min(movement.speed, rigidBody.velocity.x));
      } else {
        const decel = movement.deceleration * delta;
        if (rigidBody.velocity.x > 0) rigidBody.velocity.x = Math.max(0, rigidBody.velocity.x - decel);
        if (rigidBody.velocity.x < 0) rigidBody.velocity.x = Math.min(0, rigidBody.velocity.x + decel);
      }

      // --- WALL SLIDING ---
      movement.wallSliding = !grounded && !movement.jumping && pressingIntoWall && rigidBody.velocity.y > 0;

      if (movement.wallSliding) {
        if (rigidBody.velocity.y > movement.wallSlideMaxFallSpeed) {
          rigidBody.velocity.y = movement.wallSlideMaxFallSpeed;
        }
      }

      // --- WALL CLIMBING ---
      movement.wallClimbing = !grounded && jumpDown && !movement.jumping && pressingIntoWall;

      if (movement.wallClimbing) {
        const targetVy = -movement.wallClimbSpeed;
        const maxStep = movement.wallClimbAcceleration * delta;

        const diff = targetVy - rigidBody.velocity.y;
        const step = Math.sign(diff) * Math.min(Math.abs(diff), maxStep);
        rigidBody.velocity.y += step;

        // optional: prevent any downward velocity while climbing
        if (rigidBody.velocity.y > 0) rigidBody.velocity.y = 0;

        movement.climbedDuringAirborne = true;
      }

      movement.falling = !grounded && rigidBody.velocity.y > 0;
      movement.walking = grounded && Math.abs(rigidBody.velocity.x) > Number.EPSILON;
      movement.idle = grounded && Math.abs(rigidBody.velocity.x) <= Number.EPSILON;

      // --- AIR TIME - LANDING DETECTION ---
      const justLeftGround = !grounded && movement.wasGrounded;
      const justLanded = grounded && !movement.wasGrounded;

      if (justLeftGround) {
        movement.airborneSince = now;
        movement.climbedDuringAirborne = false;
      }

      if (justLanded) {
        const fallingAirTime = movement.wallSliding ? 0 : movement.airborneSince != null ? now - movement.airborneSince : 0;

        if (!movement.climbedDuringAirborne) {
          if (movement.landHardVFX && fallingAirTime >= 1000) {
            this.world.playEffectOnceAt(movement.landHardVFX, { x: position.x, y: position.y + bbox.height / 2 });
            movement.lastEffectTime = now + 500;
          } else if (movement.landVFX && fallingAirTime >= 400) {
            this.world.playEffectOnceAt(movement.landVFX, { x: position.x, y: position.y + bbox.height / 2 });
            movement.lastEffectTime = now + 500;
          }
        }

        movement.airborneSince = null;
        movement.climbedDuringAirborne = false;
      }

      movement.wasGrounded = grounded;

      // --- DIRECTION ADJUSTEMENTS ---
      // register direction change
      if (input.left) {
        rigidBody.direction.x = -1;
      } else if (input.right) {
        rigidBody.direction.x = 1;
      }

      // register orientation change
      if (input.aim.x < 0) {
        rigidBody.direction.x = -1; // sync aim and facing dir
        rigidBody.orientation.x = -1;
      } else if (input.aim.x > 0) {
        rigidBody.direction.x = 1; // sync aim and facing dir
        rigidBody.orientation.x = 1;
      }

      // lock direction/orientation when wallSliding
      if ((movement.wallSliding || movement.wallClimbing) && pressingIntoRightWall) {
        rigidBody.direction.x = 1;
        rigidBody.orientation.x = 1;
      }

      if ((movement.wallSliding || movement.wallClimbing) && pressingIntoLeftWall) {
        rigidBody.direction.x = -1;
        rigidBody.orientation.x = -1;
      }

      // run effect
      if (movement.runTrailVFX && movement.walking && Math.abs(rigidBody.velocity.x) >= movement.speed && grounded && (!movement.lastEffectTime || now > movement.lastEffectTime)) {
        this.world.playEffectOnceAt(movement.runTrailVFX, { x: position.x, y: position.y + (bbox?.height || 0) / 2 }, { x: rigidBody.direction.x * -1, y: 1 });
        movement.lastEffectTime = now + 250;
      }
    });
  }
}
