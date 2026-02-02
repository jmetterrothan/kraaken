import { System } from "@src/ECS";
import { DamageEvent, Position, RigidBody, Movement } from "@src/ECS/components";

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
      const kb = dmg.knockback;

      rb.velocity.x += nx * kb;
      rb.velocity.y += ny * kb - 25;

      // optional: clamp so it doesn't become insane
      const max = 900;
      rb.velocity.x = Math.max(-max, Math.min(max, rb.velocity.x));
      rb.velocity.y = Math.max(-max, Math.min(max, rb.velocity.y));

      // optional: short stun so input doesn't immediately cancel it
      if (e.hasComponent(Movement.COMPONENT_TYPE)) {
        // const mv = e.getComponent(Movement);
        //  mv.stunMs = Math.max(mv.stunMs ?? 0, 90); // add this field if you want
      }
    }
  }
}
