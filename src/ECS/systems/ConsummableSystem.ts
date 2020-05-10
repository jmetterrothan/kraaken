import System from "@src/ECS/System";

import { POSITION_COMPONENT, BOUNDING_BOX_COMPONENT, CONSUMMABLE_COMPONENT } from "@src/ECS/types";
import { BoundingBox, Position, Consummable } from "@src/ECS/components";

export class ConsummableSystem extends System {
  public constructor() {
    super([POSITION_COMPONENT, BOUNDING_BOX_COMPONENT, CONSUMMABLE_COMPONENT]);
  }

  execute(delta: number): void {
    const entities = this.world.getEntities(this.componentTypes);

    if (entities.length === 0) {
      return;
    }

    entities.forEach((entity) => {
      const position = entity.getComponent<Position>(POSITION_COMPONENT);
      const consummable = entity.getComponent<Consummable>(CONSUMMABLE_COMPONENT);
      const targets = this.world.getEntities(consummable.getComponentTypes());

      if (targets.length === 0) {
        return;
      }

      const bbox = entity.getComponent<BoundingBox>(BOUNDING_BOX_COMPONENT);

      for (const target of targets) {
        if (consummable.consummated) {
          break;
        }
        if (!consummable.canBeConsummatedBy(target)) {
          continue;
        }

        const targetBbox = target.getComponent<BoundingBox>(BOUNDING_BOX_COMPONENT);

        if (targetBbox.intersectBox(bbox)) {
          consummable.consummatedBy(target);
          consummable.consummated = true;

          const uuid = this.world.spawn({ type: "energy_bolt", position: { x: position.x, y: position.y } });

          setTimeout(() => {
            this.world.despawn(uuid);
          }, 500);

          this.world.removeEntity(entity);
        }
      }
    });
  }
}
