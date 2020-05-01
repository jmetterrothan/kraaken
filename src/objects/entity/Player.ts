import { mat3 } from "gl-matrix";

import Vector2 from "@shared/math/Vector2";
import Entity from "@src/objects/entity/Entity";
import Color from "@src/shared/helper/Color";
import World from "@src/world/World";
import ProjectileWeapon from "@src/objects/weapons/ProjectileWeapon";

import { CharacterAnimationKeys } from "@shared/models/animation.model";
import { IMovement, IPlayer } from "@shared/models/entity.model";

class Player extends Entity implements IMovement {
  protected left: boolean;
  protected right: boolean;
  protected up: boolean;
  protected down: boolean;
  protected usePrimaryWeapon: boolean;

  protected acceleration: Vector2;
  protected deceleration: Vector2;
  protected speed: Vector2;

  protected initialJumpBoost: number;
  protected jumpSpeed: number;

  protected weapon: ProjectileWeapon;

  constructor(uuid: string, x: number, y: number, direction: Vector2, data: IPlayer) {
    super(uuid, x, y, direction, data);

    this.left = false;
    this.right = false;
    this.up = false;
    this.down = false;
    this.usePrimaryWeapon = false;

    this.acceleration = new Vector2(data.metadata.acceleration.x || 0, data.metadata.acceleration.y || 0);
    this.deceleration = new Vector2(data.metadata.deceleration.x || 0, data.metadata.deceleration.y || 0);
    this.speed = new Vector2(data.metadata.speed.x || 0, data.metadata.speed.y || 0);

    this.initialJumpBoost = data.metadata.initial_jump_boost;
    this.jumpSpeed = data.metadata.jump_speed;

    this.color = new Color(0, 1, 0.75);

    this.weapon = new ProjectileWeapon(240, this);
  }

  public move(world: World, delta: number): void {
    if (this.up && !this.falling) {
      if (!this.jumping && this.canJump) {
        this.jumping = true;
        this.velocity.y = this.initialJumpBoost; // initial boost
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

    super.move(world, delta);
  }

  public update(world: World, delta: number) {
    super.update(world, delta);

    if (this.usePrimaryWeapon && this.canUsePrimaryWeapon) {
      this.weapon.update(world);
    }
  }

  public get canUsePrimaryWeapon(): boolean {
    return !this.falling && !this.up && Math.abs(this.velocity.x) < this.speed.x;
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

      case " ":
        this.usePrimaryWeapon = active;
        break;
    }
  }

  protected updateModelMatrix() {
    const offset = this.animation.getOffset();

    // correction accounting for bbox beeing at the bottom of the tile
    if (this.bbox) {
      offset.y -= (this.animation.getHeight() - this.bbox.getHeight()) / 2;
    }

    this.modelMatrix = mat3.fromTranslation(mat3.create(), this.getPosition().addScalar(0.01).add(offset).trunc().toGlArray());
  }

  protected updateCurrentAnimationKey(): string {
    /*
    if (this.dead) {
      return CharacterAnimationKeys.DEAD;
    }
    */
    if (this.falling) {
      return CharacterAnimationKeys.FALLING;
    }
    if (this.jumping) {
      return CharacterAnimationKeys.JUMPING;
    }
    if (this.usePrimaryWeapon && this.canUsePrimaryWeapon) {
      return CharacterAnimationKeys.USE_PRIMARY_WEAPON;
    }
    if (this.left || this.right) {
      return CharacterAnimationKeys.WALKING;
    }
    return CharacterAnimationKeys.IDLE;
  }
}

export default Player;
