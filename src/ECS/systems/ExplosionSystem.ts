import config from "@src/config";
import { System } from "@src/ECS";

import { Position, Explosion, Health, BoundingBox, Animator, DamageEvent } from "@src/ECS/components";

import { clamp } from "@src/shared/utility/MathHelpers";

export class ExplosionSystem extends System {
  public constructor() {
    super([Position.COMPONENT_TYPE, Explosion.COMPONENT_TYPE]);
  }

  execute(delta: number): void {
    const entities = this.world.getEntities(this.componentTypes);

    if (entities.length === 0) {
      return;
    }

    const targets = this.world.getEntities([Health.COMPONENT_TYPE, Position.COMPONENT_TYPE, BoundingBox.COMPONENT_TYPE]);

    if (targets.length === 0) {
      return;
    }

    for (let entity of entities) {
      const position = entity.getComponent(Position);
      const animator = entity.getComponent(Animator);
      const explosion = entity.getComponent(Explosion);

      explosion.elapsedMs += delta * 1000;

      const t = explosion.expandMs <= 0 ? 1 : clamp(explosion.elapsedMs / explosion.expandMs, 0, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      explosion.radius = Math.min(explosion.maxRadius * eased, explosion.maxRadius);

      for (let target of targets) {
        if (target.uuid === entity.uuid) {
          continue;
        }
        if (!explosion.canAffect(target)) {
          continue;
        }
        if (explosion.hasHit(target)) {
          continue;
        }

        const health = target.getComponent(Health);

        if (health.immunity || health.isDead) {
          continue;
        }

        const targetBbox = target.getComponent(BoundingBox);

        const dist = Math.max(0, targetBbox.distFromEdgeToPoint(position));

        if (dist > explosion.radius) continue;

        const k = 1 - clamp(dist / explosion.maxRadius, 0, 1);
        const damage = clamp(Math.round(explosion.damage * k), 1, explosion.damage);

        const knockback = { x: explosion.knockback * k, y: explosion.knockback * Math.sqrt(k) };

        health.value -= damage;
        target.addComponent(new DamageEvent({ amount: damage, isKill: health.isDead, hitstop: false, cameraShake: true, source: position.clone(), knockback }));

        if (config.DEBUG) {
          console.log(`${damage} damage inflicted\n(kx = ${knockback?.x ?? 0} ky = ${knockback?.y ?? 0}, dist = ${dist}, r = ${explosion.radius})\n${target}`);
        }

        explosion.markAsHit(target);
      }

      if (!animator || explosion.elapsedMs >= animator.animation.duration) {
        this.world.removeEntity(entity);
      }
    }
  }
}
