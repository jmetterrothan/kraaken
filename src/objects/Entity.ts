import Vector2 from '@shared/math/Vector2';
import AnimatedObject2d from '@src/objects/AnimatedObject2';

import { IEntityData } from '@src/shared/models/entity.model';

enum CHARACTER_ANIMATION_KEYS {
  idle = 'idle',
  walking = 'walking',
}

class Entity extends AnimatedObject2d {
  protected left: boolean;
  protected right: boolean;
  protected up: boolean;
  protected down: boolean;

  protected velocity: Vector2;

  constructor(x: number, y: number, data: IEntityData) {
    super(x, y, data);

    this.left = false;
    this.right = false;
    this.up = false;
    this.down = false;

    this.velocity = new Vector2();
  }

  public update(delta: number) {
    this.move(delta);
    super.update(delta);
  }

  public move(delta: number) {
    const speed = 100;

    const position = this.getPosition();

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

    this.setPositionFromVector2(position.add(this.velocity.clone().multiplyScalar(delta)).floor());
  }

  protected updateCurrentAnimationKey(): string {
    if (this.left || this.right) {
      return CHARACTER_ANIMATION_KEYS.walking;
    }
    return CHARACTER_ANIMATION_KEYS.idle;
  }
}

export default Entity;
