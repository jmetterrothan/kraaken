import { mat3 } from 'gl-matrix';

import Vector2 from '@shared/math/Vector2';
import Character from '@src/objects/entity/Character';

import { CharacterAnimationKeys } from '@shared/models/animation.model';
import { IEntityData, IMovement } from '@shared/models/entity.model';

class Player extends Character implements IMovement {
  protected left: boolean;
  protected right: boolean;
  protected up: boolean;
  protected down: boolean;

  protected acceleration: Vector2;
  protected deceleration: Vector2;
  protected speed: Vector2;
  protected gravity: Vector2;

  constructor(x: number, y: number, direction: Vector2, data: IEntityData) {
    super(x, y, direction, data);

    this.left = false;
    this.right = false;
    this.up = false;
    this.down = false;

    this.acceleration = new Vector2(15, 0);
    this.deceleration = new Vector2(25, 0);
    this.speed = new Vector2(100, 0);
    this.gravity = new Vector2(0, 0);

    this.add(this.getBbox().createHelper({ r: 1, g: 0, b: 0 }));
  }

  public move(): void {
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

    this.velocity.add(this.gravity);
  }

  public handleKeyboardInput(key: string, active: boolean) {
    switch (key) {
      case 'ArrowLeft':
        this.left = active;
        break;

      case 'ArrowRight':
        this.right = active;
        break;

      case 'ArrowUp':
        this.up = active;
        break;

      case 'ArrowDown':
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

    this.modelMatrix = mat3.fromTranslation(mat3.create(), this.getPosition().add(offset).toGlArray());
  }

  protected updateCurrentAnimationKey(): string {
    if (this.left || this.right) {
      return CharacterAnimationKeys.walking;
    }
    return CharacterAnimationKeys.idle;
  }
}

export default Player;
