import { System } from "@src/ECS";
import { Health, DamageEvent, Camera, Position } from "@src/ECS/components";

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

      if (dmg.isKill && health.deathSFX) {
        health.deathSFX.play();

        if (health.deathVFX) {
          this.world.playEffectOnceAt(health.deathVFX, pos);
        }
      } else if (health.hurtSFX) {
        health.hurtSFX.play();
      }

      if (isPlayer) {
        // receiving damage
        this.world.hitstop(dmg.isKill ? 100 : 40);
        camera.shakeOnce(dmg.isKill ? 4 : 2, dmg.isKill ? 140 : 90);
      } else {
        this.world.hitstop(60);
        camera.shakeOnce(2, 90);

        // remove dead entities from world
        if (dmg.isKill) {
          this.world.removeEntity(entity);
        }
      }

      entity.removeComponent(DamageEvent.COMPONENT_TYPE);
    }
  }
}
