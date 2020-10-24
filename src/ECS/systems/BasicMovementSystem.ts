import Entity from '@src/ECS/Entity';
import System from "@src/ECS/System";

import { BasicInput, Position, Camera } from "@src/ECS/components";

import { POSITION_COMPONENT, CAMERA_COMPONENT, BASIC_INPUT_COMPONENT } from "@src/ECS/types";

export class BasicMovementSystem extends System {
  public constructor() {
    super([POSITION_COMPONENT, BASIC_INPUT_COMPONENT]);
  }

  public clamp(entity: Entity): void {
    if (this.world.camera) {
      const camera = this.world.camera.getComponent<Camera>(CAMERA_COMPONENT);
      camera.clamp(entity);
    }
  }

  execute(delta: number): void {
    const entities = this.world.getEntities(this.componentTypes);
    if (entities.length === 0) {
      return;
    }

    entities.forEach((entity) => {
      const position = entity.getComponent<Position>(POSITION_COMPONENT);
      const input = entity.getComponent<BasicInput>(BASIC_INPUT_COMPONENT);

      let vx = 0;
      let vy = 0;

      if (input.left) {
        vx = -input.speed * delta;
      }
      else if (input.right) {
        vx = input.speed * delta;
      }
      if (input.up) {
        vy = -input.speed * delta;
      }
      else if (input.down) {
        vy = input.speed * delta;
      }

      position.addValues(vx, vy);

      this.clamp(entity);
    });
  }
}
