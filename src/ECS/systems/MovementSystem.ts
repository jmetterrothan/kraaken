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

      let grounded = rigidBody.isGrounded;

      const pressingIntoLeftWall = input.left && movement.isBlockedLeft;
      const pressingIntoRightWall = input.right && movement.isBlockedRight;

      const pressingIntoWall = pressingIntoLeftWall || pressingIntoRightWall;

      const dtMs = delta * 1000;

      // --- DASH ---
      const dashPressed = input.dash && !input.prevDashDown;
      input.prevDashDown = input.dash;

      movement.dashCooldownRemainingMs = Math.max(movement.dashCooldownRemainingMs - dtMs, 0);

      const canConsummeDash = dashPressed && !movement.dashing && movement.dashCooldownRemainingMs <= 0 && (grounded || movement.airDashesRemaining > 0) && !movement.wallClimbing;

      if (grounded) {
        movement.airDashesRemaining = movement.maxAirDashes;
      }

      if (canConsummeDash) {
        const axis = (input.right ? 1 : 0) + (input.left ? -1 : 0);

        movement.dashDir = axis !== 0 ? Math.sign(axis) : rigidBody.direction.x;
        movement.dashing = true;
        movement.dashRemainingMs = movement.dashDurationMs;
        movement.dashCooldownRemainingMs = movement.dashCooldownMs;

        if (!grounded) {
          movement.airDashesRemaining = Math.max(0, movement.airDashesRemaining - 1);
        }

        rigidBody.velocity.x = movement.dashDir * movement.dashSpeed;
        rigidBody.velocity.y = 0;
        movement.jumping = false;
        movement.wallSliding = false;
        movement.wallClimbing = false;

        movement.savedGravityScale = rigidBody.gravityScale;
        rigidBody.gravityScale = 0;
      }

      if (movement.dashing) {
        const hitWall = (movement.dashDir > 0 && movement.isBlockedRight) || (movement.dashDir < 0 && movement.isBlockedLeft);
        rigidBody.velocity.x = movement.dashDir * movement.dashSpeed;

        movement.dashRemainingMs = Math.max(0, movement.dashRemainingMs - dtMs);

        if (movement.dashRemainingMs <= 0 || hitWall) {
          rigidBody.gravityScale = movement.savedGravityScale;

          movement.dashing = false;
          rigidBody.velocity.x *= 0.2; // keep momentum
        }
      } else {
        const jumpPressed = input.jump && !input.prevJumpDown;
        input.prevJumpDown = input.jump;

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
        const canConsumeJump = movement.jumpBufferRemainingMs > 0 && movement.coyoteRemainingMs > 0 && !movement.wallSliding && !movement.wallClimbing;

        if (canConsumeJump) {
          movement.jumpBufferRemainingMs = 0;
          movement.coyoteRemainingMs = 0;

          movement.jumping = true;
          rigidBody.isGrounded = false;
          grounded = false;

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
          if (input.jump && rigidBody.velocity.y < 0 && !movement.wallClimbing) {
            rigidBody.velocity.y += -movement.jumpSpeed * delta;
          }

          // release-to-cut jump
          if (!input.jump && rigidBody.velocity.y < 0) {
            rigidBody.velocity.y *= 0.5;
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

        // --- WALL CLIMBING ---
        const wasWallClimbing = movement.wallClimbing;

        movement.wallClimbing = !grounded && !movement.jumping && pressingIntoWall && movement.wallClimbStamina > 0;

        if (movement.wallClimbing) {
          const vyAxis = (input.up ? -1 : 0) + (input.down ? 1 : 0); // up/down/none
          const targetVy = movement.wallClimbSpeed * vyAxis;

          const maxStep = movement.wallClimbAcceleration * delta;

          const diff = targetVy - rigidBody.velocity.y;
          const step = Math.sign(diff) * Math.min(Math.abs(diff), maxStep);
          rigidBody.velocity.y += step;

          // prevent any downward velocity while climbing
          if (vyAxis === 0) {
            rigidBody.velocity.y = 0;
          }

          if (vyAxis < 0) {
            movement.wallClimbStamina = Math.max(0, movement.wallClimbStamina - movement.wallClimbStaminaConsumptionPerS * delta);
          }
          movement.climbedDuringAirborne = true;

          if (vyAxis !== 0 && movement.wallSlideVFX && now > movement.lastEffectTime) {
            this.world.playEffectOnceAt(movement.wallSlideVFX, { x: pressingIntoLeftWall ? position.x - bbox.width / 2 : position.x + bbox.width / 2, y: position.y + bbox.height / 2 });
            movement.lastEffectTime = now + 300;
          }
        }

        // wall climbing stamina reset
        if (!movement.wallClimbing && grounded) {
          movement.wallClimbStamina = Math.min(movement.maxWallClimbStamina, movement.wallClimbStamina + movement.wallClimbStaminaRecoveryPerS * delta);
        }

        if (movement.wallClimbing && !wasWallClimbing) {
          movement.savedGravityScale = rigidBody.gravityScale;
          rigidBody.gravityScale = 0;
        }

        if (!movement.wallClimbing && wasWallClimbing) {
          rigidBody.gravityScale = movement.savedGravityScale;
        }

        // --- WALL SLIDING ---
        movement.wallSliding = !grounded && !movement.wallClimbing && pressingIntoWall && rigidBody.velocity.y > 0;

        if (movement.wallSliding) {
          if (rigidBody.velocity.y > movement.wallSlideMaxFallSpeed) {
            rigidBody.velocity.y = movement.wallSlideMaxFallSpeed;
          }

          if (movement.wallSlideVFX && now > movement.lastEffectTime) {
            this.world.playEffectOnceAt(movement.wallSlideVFX, { x: pressingIntoLeftWall ? position.x - bbox.width / 2 : position.x + bbox.width / 2, y: position.y - bbox.height / 2 });
            movement.lastEffectTime = now + 300;
          }
        }
      }

      movement.landing = false;
      movement.falling = !movement.dashing && !grounded && rigidBody.velocity.y >= 0;
      movement.walking = grounded && Math.abs(rigidBody.velocity.x) > Number.EPSILON;
      movement.idle = grounded && !movement.walking;

      // --- AIR TIME - LANDING DETECTION ---
      const justLeftGround = !grounded && movement.wasGrounded;
      const justLanded = grounded && !movement.wasGrounded;

      if (justLeftGround) {
        movement.airborneSince = now;
        movement.climbedDuringAirborne = false;
      }

      if (justLanded) {
        movement.landing = true;

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
        movement.wallClimbStamina = movement.maxWallClimbStamina;
      }

      movement.wasGrounded = grounded;

      // --- DIRECTION ADJUSTEMENTS ---
      // register direction change
      if (input.left) {
        rigidBody.direction.x = -1;
        rigidBody.orientation.x = -1;
      } else if (input.right) {
        rigidBody.direction.x = 1;
        rigidBody.orientation.x = 1;
      }

      /*
      // register orientation change
      if (input.aim.x < 0) {
        rigidBody.direction.x = -1; // sync aim and facing dir
        rigidBody.orientation.x = -1;
      } else if (input.aim.x > 0) {
        rigidBody.direction.x = 1; // sync aim and facing dir
        rigidBody.orientation.x = 1;
      }
        */

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
