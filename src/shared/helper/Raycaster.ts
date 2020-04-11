import Entity from "@src/objects/entity/Entity";
import Vector2 from "@src/shared/math/Vector2";

class Raycaster {
  private position: Vector2;
  private direction: Vector2;
  private stoppedAt: Vector2;

  constructor(position?: Vector2, direction?: Vector2) {
    this.position = position;
    this.direction = direction;
  }

  set(position: Vector2, direction: Vector2) {
    this.position = position;
    this.direction = direction;
    this.stoppedAt = null;
  }

  intersectEntity(entity: Entity): boolean {
    const a = this.position.clone();
    const b = this.position.clone().add(this.direction.multiplyScalar(1000));

    return entity.getBbox().intersectSegment(a, b) !== undefined;
  }
}

export default Raycaster;
