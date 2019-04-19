import { CharacterAnimationKeys } from '@shared/models/animation.model';
import { IEntityData } from '@shared/models/entity.model';
import Entity from '@src/objects/entity/Entity';

class Player extends Entity {
  protected left: boolean;
  protected right: boolean;
  protected up: boolean;
  protected down: boolean;

  constructor(x: number, y: number, data: IEntityData) {
    super(x, y, data);

    this.left = false;
    this.right = false;
    this.up = false;
    this.down = false;
  }

  public move(delta: number) {
    const speed = 100;

    this.velocity.x = 0;
    this.velocity.y = 0;

    if (this.left) {
      this.velocity.x = -speed;
    } else if (this.right) {
      this.velocity.x = speed;
    }

    if (this.up) {
      this.velocity.y = -speed;
    } else if (this.down) {
      this.velocity.y = speed;
    }

    // change direction based of velocity
    if (this.velocity.x !== 0) {
      const direction = this.velocity.clone().normalize().ceil();
      if (direction.x !== 0) {
        this.direction.x = direction.x;
      }
    }
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

  protected updateCurrentAnimationKey(): string {
    if (this.left || this.right) {
      return CharacterAnimationKeys.walking;
    }
    return CharacterAnimationKeys.idle;
  }
}

export default Player;
