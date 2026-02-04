import { System } from "@src/ECS";
import { DamageEvent, Fuse, Health } from "@src/ECS/components";

export class FuseSystem extends System {
  constructor() {
    super([Fuse.COMPONENT_TYPE]);
  }

  execute(delta: number): void {
    const entities = this.world.getEntities(this.componentTypes);

    for (const e of entities) {
      const fuse = e.getComponent(Fuse);
      const health = e.getComponent(Health);

      if (fuse.triggered) {
        continue;
      }

      fuse.remainingMs -= delta * 1000;

      if (fuse.remainingMs <= 0) {
        fuse.triggered = true;

        if (fuse.expireAction === "kill") {
          if (health.isDead) {
            continue;
          }

          e.addComponent(new DamageEvent({ amount: Infinity, isKill: true, hitstop: false, cameraShake: false }));
        } else {
          this.world.despawn(e.uuid);
        }
      }
    }
  }
}
