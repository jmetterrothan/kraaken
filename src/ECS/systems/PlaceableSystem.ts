import System from "@src/ECS/System";

import { Position, Placeable } from "@src/ECS/components";
import { PLACEABLE_COMPONENT, POSITION_COMPONENT } from "@src/ECS/types";

export class PlaceableSystem extends System {
  public constructor() {
    super([PLACEABLE_COMPONENT, POSITION_COMPONENT]);
  }

  execute(delta: number): void {
    const entities = this.world.getEntities(this.componentTypes);
    if (entities.length === 0) {
      return;
    }

    entities.forEach((entity) => {
      const placeable = entity.getComponent<Placeable>(PLACEABLE_COMPONENT);
      const position = entity.getComponent<Position>(POSITION_COMPONENT);

      // Follow target
      if (placeable.target) {
        const targetPos = placeable.target.getComponent<Position>(POSITION_COMPONENT);

        if (targetPos) {
          position.lerp(targetPos, 0.15);
        }
      }
    });
  }
}
