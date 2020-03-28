import { mat3 } from "gl-matrix";

import Vector2 from "@shared/math/Vector2";
import Entity from "@src/objects/entity/Entity";
import Color from "@src/shared/helper/Color";
import World from "@src/world/World";

import { CharacterAnimationKeys } from "@shared/models/animation.model";
import { IMovement, IPlayerData } from "@shared/models/entity.model";

class Player extends Entity implements IMovement {
  protected left: boolean;
  protected right: boolean;
  protected up: boolean;
  protected down: boolean;

  protected acceleration: Vector2;
  protected deceleration: Vector2;
  protected speed: Vector2;

  protected maxJumpHeight: number;
  protected jumpSpeed: number;

  constructor(x: number, y: number, direction: Vector2, data: IPlayerData) {
    super(x, y, direction, data);

    this.left = false;
    this.right = false;
    this.up = false;
    this.down = false;

    this.acceleration = new Vector2(
      data.acceleration.x || 0,
      data.acceleration.y || 0
    );
    this.deceleration = new Vector2(
      data.deceleration.x || 0,
      data.deceleration.y || 0
    );
    this.speed = new Vector2(data.speed.x || 0, data.speed.y || 0);

    this.maxJumpHeight = data.max_jump_height;
    this.jumpSpeed = data.jump_speed;

    this.color = new Color(0, 1, 0.75);
  }

  public move(world: World, delta: number): void {
    if (this.up && !this.falling) {
      if (!this.jumping && this.velocity.y === 0) {
        this.jumping = true;
        this.velocity.y = this.maxJumpHeight * delta; // initial boost
      } else {
        this.velocity.y += this.jumpSpeed * delta; // maintain momentum
      }
    } else {
      this.jumping = false;
    }

    if (this.left) {
      this.velocity.x -= this.acceleration.x;
      if (this.velocity.x < -this.speed.x) {
        this.velocity.x = -this.speed.x;
      }
    } else if (this.right) {
      this.velocity.x += this.acceleration.x;
      if (this.velocity.x > this.speed.x) {
        this.velocity.x = this.speed.x;
      }
    } else {
      if (this.velocity.x > 0) {
        this.velocity.x -= this.deceleration.x;
        if (this.velocity.x < 0) {
          this.velocity.x = 0;
        }
      }
      if (this.velocity.x < 0) {
        this.velocity.x += this.deceleration.x;
        if (this.velocity.x > 0) {
          this.velocity.x = 0;
        }
      }
    }

    this.velocity.add(world.getGravity());
  }

  public handleKeyboardInput(key: string, active: boolean) {
    switch (key) {
      case "ArrowLeft":
        this.left = active;
        break;

      case "ArrowRight":
        this.right = active;
        break;

      case "ArrowUp":
        this.up = active;
        break;

      case "ArrowDown":
        this.down = active;
        break;
    }
  }

  protected updateModelMatrix() {
    const offset = this.animation.getOffset();

    // correction accounting for bbox beeing at the bottom of the tile
    if (this.bbox) {
      offset.y -= (this.animation.getHeight() - this.bbox.getHeight()) / 2;
    }

    this.modelMatrix = mat3.fromTranslation(
      mat3.create(),
      this.getPosition()
        .add(offset)
        .toGlArray()
    );
  }

  protected updateCurrentAnimationKey(): string {
    if (this.falling) {
      return CharacterAnimationKeys.falling;
    }
    if (this.jumping) {
      return CharacterAnimationKeys.jumping;
    }
    if (this.left || this.right) {
      return CharacterAnimationKeys.walking;
    }
    return CharacterAnimationKeys.idle;
  }
}

export default Player;
