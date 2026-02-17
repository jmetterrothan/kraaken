import { System } from "@src/ECS";
import { DamageEvent, Position, RigidBody } from "@src/ECS/components";

export class KnockbackSystem extends System {
  constructor() {
    super([DamageEvent.COMPONENT_TYPE, Position.COMPONENT_TYPE, RigidBody.COMPONENT_TYPE]);
  }

  execute(_delta: number): void {
    const entities = this.world.getEntities(this.componentTypes);

    for (const e of entities) {
      const dmg = e.getComponent(DamageEvent);
      if (!dmg.knockback || !dmg.source) continue;

      const pos = e.getComponent(Position);
      const rb = e.getComponent(RigidBody);

      // direction away from source
      const dx = pos.x - dmg.source.x;
      const dy = pos.y - dmg.source.y;
      const len = Math.hypot(dx, dy) || 1;

      const nx = dx / len;
      const ny = dy / len;

      // impulse (platformer-friendly: mostly horizontal + a bit upward)
      rb.velocity.x += nx * dmg.knockback.x;
      rb.velocity.y += ny * dmg.knockback.y;
    }
  }
}
