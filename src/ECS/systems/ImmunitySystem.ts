import { System } from "@src/ECS";
import { Health } from "@src/ECS/components";

export class ImmunitySystem extends System {
  constructor() {
    super([Health.COMPONENT_TYPE]);
  }

  execute(delta: number): void {
    const entities = this.world.getEntities(this.componentTypes);

    for (const e of entities) {
      const health = e.getComponent(Health);

      if (health.immunity) {
        health.remainingImmunityMs -= delta * 1000;

        if (health.remainingImmunityMs <= 0) {
          health.immunity = false;
          health.remainingImmunityMs = 0;
        }
      }

      if (health.hit) {
        health.remainingHitMs -= delta * 1000;

        if (health.remainingHitMs <= 0) {
          health.hit = false;
          health.remainingHitMs = 0;
        }
      }
    }
  }
}
