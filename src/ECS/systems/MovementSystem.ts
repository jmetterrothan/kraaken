import { Entity, System } from "@src/ECS";

import { Movement, PlayerInput, Position, BoundingBox, RigidBody } from "@src/ECS/components";

type Ctx = {
  pressingIntoLeftWall: boolean;
  pressingIntoRightWall: boolean;
  pressingIntoWall: boolean;
};

type Motor = {
  vx: number;
  vy: number;
  gravityScale: number;

  // axis locks / overrides (explicit arbitration)
  lockX: boolean;
  lockY: boolean;
};

export class MovementSystem extends System {
  public constructor() {
    super([Position.COMPONENT_TYPE, RigidBody.COMPONENT_TYPE, Movement.COMPONENT_TYPE, PlayerInput.COMPONENT_TYPE, BoundingBox.COMPONENT_TYPE]);
  }

  updateDash(entity: Entity, _ctx: Ctx, motor: Motor, delta: number): void {
    const dtMs = delta * 1000;

    const movement = entity.getComponent(Movement);
    const input = entity.getComponent(PlayerInput);
    const rigidBody = entity.getComponent(RigidBody);

    movement.dashCooldownRemainingMs = Math.max(movement.dashCooldownRemainingMs - dtMs, 0);

    const canConsummeDash = input.dashPressed && !movement.dashing && movement.dashCooldownRemainingMs <= 0 && (rigidBody.isGrounded || movement.airDashesRemaining > 0) && !movement.wallClimbing;

    if (rigidBody.isGrounded) {
      movement.airDashesRemaining = movement.maxAirDashes;
    }

    if (canConsummeDash) {
      const axis = (input.right ? 1 : 0) + (input.left ? -1 : 0);

      movement.dashDir = axis !== 0 ? Math.sign(axis) : rigidBody.direction.x;
      movement.dashing = true;
      movement.dashRemainingMs = movement.dashDurationMs;
      movement.dashCooldownRemainingMs = movement.dashCooldownMs;

      if (!rigidBody.isGrounded) {
        movement.airDashesRemaining = Math.max(0, movement.airDashesRemaining - 1);
      }

      motor.vx = movement.dashDir * movement.dashSpeed;
      motor.vy = 0;
      movement.jumping = false;
      movement.wallSliding = false;
      movement.wallClimbing = false;

      movement.savedGravityScale = motor.gravityScale;
      motor.gravityScale = 0;
    }

    if (movement.dashing) {
      const hitWall = (movement.dashDir > 0 && movement.isBlockedRight) || (movement.dashDir < 0 && movement.isBlockedLeft);
      motor.vx = movement.dashDir * movement.dashSpeed;
      motor.vy = 0;
      motor.gravityScale = 0;

      movement.dashRemainingMs = Math.max(0, movement.dashRemainingMs - dtMs);

      motor.lockX = true;
      motor.lockY = true;

      if (movement.dashRemainingMs <= 0 || hitWall) {
        motor.gravityScale = movement.savedGravityScale;

        movement.dashing = false;
        motor.lockX = false;
        motor.lockY = false;
        motor.vx *= 0.2; // keep momentum
      }
    }
  }

  updateJump(entity: Entity, _ctx: Ctx, motor: Motor, delta: number): void {
    const now = window.performance.now();

    const dtMs = delta * 1000;

    const rigidBody = entity.getComponent(RigidBody);
    const movement = entity.getComponent(Movement);
    const position = entity.getComponent(Position);
    const bbox = entity.getComponent(BoundingBox);
    const input = entity.getComponent(PlayerInput);

    // --- COYOTE TIME ---
    if (rigidBody.isGrounded) {
      movement.coyoteRemainingMs = movement.coyoteTimeMs;
    } else {
      movement.coyoteRemainingMs = Math.max(0, movement.coyoteRemainingMs - dtMs);
    }

    // --- JUMP BUFFER ---
    if (input.jumpPressed) {
      movement.jumpBufferRemainingMs = movement.jumpBufferMs;
    } else {
      movement.jumpBufferRemainingMs = Math.max(0, movement.jumpBufferRemainingMs - dtMs);
    }

    // --- CONSUME BUFFER IF WE CAN JUMP ---
    const canConsumeJump = !motor.lockY && movement.jumpBufferRemainingMs > 0 && movement.coyoteRemainingMs > 0 && !movement.wallSliding && !movement.wallClimbing;

    if (canConsumeJump) {
      movement.jumpBufferRemainingMs = 0;
      movement.coyoteRemainingMs = 0;

      movement.jumping = true;

      motor.vy = -movement.initialJumpBoost;

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
      if (!motor.lockY && input.jump && motor.vy < 0 && !movement.wallClimbing) {
        motor.vy += -movement.jumpSpeed * delta;
      }

      // release-to-cut jump
      if (!motor.lockY && !input.jump && motor.vy < 0) {
        motor.vy *= 0.5;
      }

      // stop “jumping” state once you start falling
      if (motor.vy >= 0) {
        movement.jumping = false;
      }
    }
  }

  updateWallClimbing(entity: Entity, ctx: Ctx, motor: Motor, delta: number): void {
    const movement = entity.getComponent(Movement);

    if (motor.lockY) {
      movement.wallClimbing = false;
      return;
    }

    const now = window.performance.now();

    const rigidBody = entity.getComponent(RigidBody);
    const position = entity.getComponent(Position);
    const bbox = entity.getComponent(BoundingBox);
    const input = entity.getComponent(PlayerInput);

    const wasWallClimbing = movement.wallClimbing;

    movement.wallClimbing = !rigidBody.isGrounded && !movement.jumping && ctx.pressingIntoWall && movement.wallClimbStamina > 0;

    if (movement.wallClimbing) {
      const vyAxis = (input.up ? -1 : 0) + (input.down ? 1 : 0); // up/down/none
      const targetVy = movement.wallClimbSpeed * vyAxis;

      const maxStep = movement.wallClimbAcceleration * delta;

      const diff = targetVy - motor.vy;
      const step = Math.sign(diff) * Math.min(Math.abs(diff), maxStep);
      motor.vy += step;
      motor.lockY = true;

      // prevent any downward velocity while climbing
      if (vyAxis === 0) {
        motor.vy = 0;
      }

      if (vyAxis < 0) {
        movement.wallClimbStamina = Math.max(0, movement.wallClimbStamina - movement.wallClimbStaminaConsumptionPerS * delta);
      }

      movement.climbedDuringAirborne = true;
      movement.wallSliding = false;

      if (vyAxis !== 0 && movement.wallSlideVFX && now > movement.lastEffectTime) {
        this.world.playEffectOnceAt(movement.wallSlideVFX, { x: ctx.pressingIntoLeftWall ? position.x - bbox.width / 2 : position.x + bbox.width / 2, y: position.y + bbox.height / 2 });
        movement.lastEffectTime = now + 300;
      }
    }

    // wall climbing stamina reset
    if (!movement.wallClimbing && rigidBody.isGrounded) {
      movement.wallClimbStamina = Math.min(movement.maxWallClimbStamina, movement.wallClimbStamina + movement.wallClimbStaminaRecoveryPerS * delta);
    }

    if (movement.wallClimbing && !wasWallClimbing) {
      movement.savedGravityScale = motor.gravityScale;
      motor.gravityScale = 0;
    }

    if (!movement.wallClimbing && wasWallClimbing) {
      motor.gravityScale = movement.savedGravityScale;
    }
  }

  updateWallSliding(entity: Entity, ctx: Ctx, motor: Motor, _delta: number): void {
    const movement = entity.getComponent(Movement);

    if (motor.lockY) {
      movement.wallSliding = false;
      return;
    }

    const now = window.performance.now();

    const rigidBody = entity.getComponent(RigidBody);
    const position = entity.getComponent(Position);
    const bbox = entity.getComponent(BoundingBox);

    movement.wallSliding = !rigidBody.isGrounded && !movement.wallClimbing && ctx.pressingIntoWall && motor.vy > 0;

    if (movement.wallSliding) {
      if (motor.vy > movement.wallSlideMaxFallSpeed) {
        motor.vy = movement.wallSlideMaxFallSpeed;
      }

      if (movement.wallSlideVFX && now > movement.lastEffectTime) {
        this.world.playEffectOnceAt(movement.wallSlideVFX, { x: ctx.pressingIntoLeftWall ? position.x - bbox.width / 2 : position.x + bbox.width / 2, y: position.y - bbox.height / 2 });
        movement.lastEffectTime = now + 300;
      }
    }
  }

  updateWalk(entity: Entity, _ctx: Ctx, motor: Motor, delta: number): void {
    if (motor.lockX) {
      return;
    }

    const movement = entity.getComponent(Movement);
    const input = entity.getComponent(PlayerInput);

    if (input.right || input.left) {
      const axis = (input.right ? 1 : 0) + (input.left ? -1 : 0);

      motor.vx += axis * movement.acceleration * delta;
      motor.vx = Math.max(-movement.speed, Math.min(movement.speed, motor.vx));
    } else {
      const decel = movement.deceleration * delta;
      if (motor.vx > 0) motor.vx = Math.max(0, motor.vx - decel);
      if (motor.vx < 0) motor.vx = Math.min(0, motor.vx + decel);
    }
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

      const pressingIntoLeftWall = input.left && movement.isBlockedLeft;
      const pressingIntoRightWall = input.right && movement.isBlockedRight;

      const pressingIntoWall = pressingIntoLeftWall || pressingIntoRightWall;

      const ctx: Ctx = {
        pressingIntoLeftWall,
        pressingIntoRightWall,
        pressingIntoWall,
      };

      const motor: Motor = {
        vx: rigidBody.velocity.x,
        vy: rigidBody.velocity.y,
        gravityScale: rigidBody.gravityScale,
        lockX: false,
        lockY: false,
      };

      this.updateDash(entity, ctx, motor, delta);
      this.updateWallClimbing(entity, ctx, motor, delta);
      this.updateWallSliding(entity, ctx, motor, delta);
      this.updateJump(entity, ctx, motor, delta);
      this.updateWalk(entity, ctx, motor, delta);

      rigidBody.velocity.x = motor.vx;
      rigidBody.velocity.y = motor.vy;
      rigidBody.gravityScale = motor.gravityScale;

      movement.landing = false;
      movement.falling = !movement.dashing && !rigidBody.isGrounded && rigidBody.velocity.y >= 0;
      movement.walking = rigidBody.isGrounded && Math.abs(rigidBody.velocity.x) > Number.EPSILON;
      movement.idle = rigidBody.isGrounded && !movement.walking;

      // --- AIR TIME - LANDING DETECTION ---
      const justLeftGround = !rigidBody.isGrounded && movement.wasGrounded;
      const justLanded = rigidBody.isGrounded && !movement.wasGrounded;

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

      movement.wasGrounded = rigidBody.isGrounded;

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
      if ((movement.wallSliding || movement.wallClimbing) && ctx.pressingIntoRightWall) {
        rigidBody.direction.x = 1;
        rigidBody.orientation.x = 1;
      }

      if ((movement.wallSliding || movement.wallClimbing) && ctx.pressingIntoLeftWall) {
        rigidBody.direction.x = -1;
        rigidBody.orientation.x = -1;
      }

      if (movement.dashing && movement.dashDir > 0) {
        rigidBody.direction.x = 1;
        rigidBody.orientation.x = 1;
      }
      if (movement.dashing && movement.dashDir < 0) {
        rigidBody.direction.x = -1;
        rigidBody.orientation.x = -1;
      }

      // run effect
      if (movement.runTrailVFX && movement.walking && Math.abs(rigidBody.velocity.x) >= movement.speed && rigidBody.isGrounded && (!movement.lastEffectTime || now > movement.lastEffectTime)) {
        this.world.playEffectOnceAt(movement.runTrailVFX, { x: position.x, y: position.y + (bbox?.height || 0) / 2 }, { x: rigidBody.direction.x * -1, y: 1 });
        movement.lastEffectTime = now + 250;
      }
    });
  }
}
