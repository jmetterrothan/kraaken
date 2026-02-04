import { System } from "@src/ECS";

import { Sprite, Health } from "@src/ECS/components";
import { TintEffect } from "@src/shared/models/animation.model";

/**
 * Make sprite flicker when an entity that can take damages enters immunity mode
 */
export class FlickerOnImmuneSystem extends System {
  public constructor() {
    super([Sprite.COMPONENT_TYPE, Health.COMPONENT_TYPE]);
  }

  public execute(_delta: number): void {
    const entities = this.world.getEntities(this.componentTypes);
    if (entities.length === 0) {
      return;
    }

    entities.forEach((entity) => {
      const sprite = entity.getComponent(Sprite);
      const health = entity.getComponent(Health);

      sprite.renderOptions.flickering = health.immunity;
      sprite.renderOptions.tintEffect = health.hit ? TintEffect.EFFECT1 : TintEffect.NONE;
    });
  }
}
