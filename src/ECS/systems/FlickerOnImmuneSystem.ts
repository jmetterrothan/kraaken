import { System } from "@src/ECS";

import { Sprite, Health } from "@src/ECS/components";

/**
 * Make sprite flicker when an entity that can take damages enters immunity mode
 */
export class FlickerOnImmuneSystem extends System {
  public constructor() {
    super([Sprite.COMPONENT_TYPE, Health.COMPONENT_TYPE]);
  }

  public execute(delta: number): void {
    const entities = this.world.getEntities(this.componentTypes);
    if (entities.length === 0) {
      return;
    }

    entities.forEach((entity) => {    
      const sprite = entity.getComponent(Sprite);
      const health = entity.getComponent(Health);

      sprite.renderOptions.flickering = health.immunity;
    });
  }
}
