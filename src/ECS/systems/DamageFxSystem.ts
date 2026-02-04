import { System } from "@src/ECS";
import { Health, DamageEvent, Camera, Position, Fuse } from "@src/ECS/components";
import { clamp, lerp } from "@src/shared/utility/MathHelpers";

export class DamageFxSystem extends System {
  constructor() {
    super([DamageEvent.COMPONENT_TYPE, Health.COMPONENT_TYPE]);
  }

  execute(_delta: number): void {
    const entities = this.world.getEntities(this.componentTypes);

    const camera = this.world.camera.getComponent(Camera);

    for (const entity of entities) {
      const health = entity.getComponent(Health);
      const dmg = entity.getComponent(DamageEvent);
      const pos = entity.getComponent(Position);

      const isPlayer = this.world.player === entity;

      if (dmg.isKill) {
        if (health.deathSFX) {
          health.deathSFX.play();
        }

        if (health.deathVFX) {
          this.world.playEffectOnceAt(health.deathVFX, pos);
        }
      } else if (health.hurtSFX) {
        health.hurtSFX.play();
      }

      const impact = Math.sqrt(clamp(dmg.amount / health.maxHealth, 0, 1));

      if (dmg.hitstop) this.world.hitstop(dmg.isKill ? 100 : lerp(40, 80, impact));
      if (dmg.cameraShake) camera.shakeOnce(dmg.isKill ? 6 : lerp(2, 6, impact), dmg.isKill ? 120 : lerp(60, 120, impact));

      if (!isPlayer) {
        // remove dead entities from world
        if (dmg.isKill) {
          entity.addComponent(new Fuse({ delay: health.hitDelayMs, expireAction: "despawn" }));
        }
      }

      entity.removeComponent(DamageEvent.COMPONENT_TYPE);
    }
  }
}
