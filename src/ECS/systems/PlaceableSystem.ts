import { System } from "@src/ECS";

import { Position, Placeable } from "@src/ECS/components";

export class PlaceableSystem extends System {
  public constructor() {
    super([Placeable.COMPONENT_TYPE, Position.COMPONENT_TYPE]);
  }

  execute(delta: number): void {
    const entities = this.world.getEntities(this.componentTypes);
    if (entities.length === 0) {
      return;
    }

    entities.forEach((entity) => {
      const placeable = entity.getComponent(Placeable);
      const position = entity.getComponent(Position);

      // Follow target
      if (placeable.target) {
        const targetPos = placeable.target.getComponent(Position);

        if (targetPos) {
          position.lerp(targetPos, 0.15);
        }
      }
    });
  }
}
