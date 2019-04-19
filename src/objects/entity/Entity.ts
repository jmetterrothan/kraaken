import Vector2 from '@shared/math/Vector2';
import AnimatedObject2d from '@src/objects/AnimatedObject2d';
import Box2 from '@src/shared/math/Box2';
import World from '@src/world/World';

import Object2d from '@src/objects/Object2d';
import { IEntityData } from '@src/shared/models/entity.model';

class Entity extends AnimatedObject2d {
  protected velocity: Vector2;
  protected bbox: Box2;

  constructor(x: number, y: number, data: IEntityData) {
    super(x, y, data);

    this.velocity = new Vector2(0, 0);
    this.bbox = new Box2(x, y, data.metadata.bbox.w, data.metadata.bbox.h);
  }

  public collideWith(object: Entity | Object2d): boolean {
    if (object instanceof Entity && this.bbox.containsBox(object.getBbox())) {
      return true;
    }

    if (object instanceof Object2d && this.bbox.containsPoint(object.getPosition())) {
      return true;
    }

    return false;
  }

  public update(world: World, delta: number) {
    if (this.move !== undefined) {
      this.move(delta);
    }

    if (this.velocity.x !== 0 || this.velocity.y !== 0) {
      this.setPositionFromVector2(
        this.getPosition().add(this.velocity.clone().multiplyScalar(delta)).floor(),
      );
    }

    this.bbox.setPositionFromCenter(this.getX(), this.getY());
    super.update(world, delta);
  }

  public move(delta: number) { }

  public getBbox(): Box2 { return this.bbox; }
}

export default Entity;
