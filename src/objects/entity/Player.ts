import { mat3 } from 'gl-matrix';

import Character from '@src/objects/entity/Character';

import { CharacterAnimationKeys } from '@shared/models/animation.model';
import { IEntityData, IMovement } from '@shared/models/entity.model';

class Player extends Character implements IMovement {
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

    this.add(this.getBbox().createHelper({ r: 1, g: 0, b: 0 }));
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
