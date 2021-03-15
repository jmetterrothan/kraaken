import { System, Entity } from "@src/ECS";

import { BasicInput, Position, Camera, RigidBody } from "@src/ECS/components";

export class BasicMovementSystem extends System {
  public constructor() {
    super([Position.COMPONENT_TYPE, BasicInput.COMPONENT_TYPE]);
  }

  public clamp(entity: Entity): void {
    if (this.world.camera) {
      const camera = this.world.camera.getComponent(Camera);
      camera.clamp(entity);
    }
  }

  execute(delta: number): void {
    const entities = this.world.getEntities(this.componentTypes);
    if (entities.length === 0) {
      return;
    }

    entities.forEach((entity) => {
      const position = entity.getComponent(Position);
      const input = entity.getComponent(BasicInput);

      let vx = 0;
      let vy = 0;

      if (input.left) {
        vx = -input.speed * delta;
      } else if (input.right) {
        vx = input.speed * delta;
      }
      if (input.up) {
        vy = -input.speed * delta;
      } else if (input.down) {
        vy = input.speed * delta;
      }

      position.addValues(vx, vy);

      this.clamp(entity);
    });
  }
}
