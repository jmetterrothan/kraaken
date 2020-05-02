import { mat3 } from "gl-matrix";

import SFX from "@src/objects/sfx/SFX";
import Vector2 from "@shared/math/Vector2";
import Entity from "@src/objects/entity/Entity";
import Color from "@src/shared/helper/Color";
import World from "@src/world/World";
import ProjectileWeapon from "@src/objects/entity/weapons/ProjectileWeapon";

import { CharacterAnimationKeys } from "@shared/models/animation.model";
import { IMovementBehaviour, ICharacter } from "@shared/models/entity.model";

class Character extends Entity implements IMovementBehaviour {
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

  protected maxHealth: number;
  protected health: number;
  protected dead: boolean;

  constructor(uuid: string, x: number, y: number, direction: Vector2, data: ICharacter) {
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

    this.weapon = new ProjectileWeapon(320, this);

    this.maxHealth = data.metadata.max_health;
    this.health = this.maxHealth;
    this.dead = false;
  }

  public jump() {}

  public move(world: World, delta: number): void {
    if (this.up && !this.falling && !this.dead) {
      if (!this.jumping && this.canJump) {
        this.jumping = true;
        this.velocity.y = this.initialJumpBoost; // initial boost

        this.jump();
      } else {
        this.velocity.y += this.jumpSpeed * delta; // maintain momentum
      }
    } else {
      this.jumping = false;
    }

    if (this.left && !this.dead) {
      this.velocity.x -= this.acceleration.x;
      if (this.velocity.x < -this.speed.x) {
        this.velocity.x = -this.speed.x;
      }
    } else if (this.right && !this.dead) {
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

  protected die() {
    if (this.dead) {
      return;
    }

    this.dead = true;

    this.add(SFX.createPooled(this.getX(), this.getY(), new Vector2(1, 1), "explosion"));
    this.setVisible(false);
    this.setDirty(true);
  }

  public update(world: World, delta: number) {
    super.update(world, delta);

    if (this.usePrimaryWeapon && this.canUsePrimaryWeapon) {
      this.weapon.update(world);
    }
  }

  public get canUsePrimaryWeapon(): boolean {
    return !this.dead && !this.falling && !this.up && Math.abs(this.velocity.x) < this.speed.x;
  }

  protected updateModelMatrix() {
    if (!this.animation) {
      return;
    }

    const offset = this.animation.getOffset();

    // correction accounting for bbox beeing at the bottom of the tile
    if (this.bbox) {
      offset.y -= (this.animation.getHeight() - this.bbox.getHeight()) / 2;
    }

    this.modelMatrix = mat3.fromTranslation(mat3.create(), this.getPosition().addScalar(0.01).add(offset).trunc().toGlArray());
  }

  protected updateCurrentAnimationKey(): string {
    if (this.dead) {
      return CharacterAnimationKeys.DEAD;
    }
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

  public isDead(): boolean {
    return this.dead;
  }

  public getHealth(): number {
    return this.health;
  }

  public getMaxHealth(): number {
    return this.maxHealth;
  }

  public setHealth(health: number) {
    this.health = health;

    if (this.health < 0) {
      this.health = 0;
    }
    if (this.health === 0) {
      this.die();
    }
  }
}

export default Character;
