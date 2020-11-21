import System from "@src/ECS/System";

import { Sprite, Health } from "@src/ECS/components";

import { SPRITE_COMPONENT, HEALTH_COMPONENT } from "@src/ECS/types";

/**
 * Make sprite flicker when an entity that can take damages enters immunity mode
 */
export class FlickerOnImmuneSystem extends System {
  public constructor() {
    super([SPRITE_COMPONENT, HEALTH_COMPONENT]);
  }

  public execute(delta: number): void {
    const entities = this.world.getEntities(this.componentTypes);
    if (entities.length === 0) {
      return;
    }

    entities.forEach((entity) => {    
      const sprite = entity.getComponent<Sprite>(SPRITE_COMPONENT);
      const health = entity.getComponent<Health>(HEALTH_COMPONENT);

      sprite.renderOptions.flickering = health.immunity;
    });
  }
}
