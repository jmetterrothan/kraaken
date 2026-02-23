import { System } from "@src/ECS";
import { DeathEvent, Loot, Position, RigidBody } from "@src/ECS/components";
import Vector2 from "@src/shared/math/Vector2";
import { degToRad, getRandomFloat, getRandomIntInclusive } from "@src/shared/utility/MathHelpers";

export class LootSystem extends System {
  constructor() {
    super([Position.COMPONENT_TYPE, Loot.COMPONENT_TYPE, DeathEvent.COMPONENT_TYPE]);
  }

  execute(_delta: number): void {
    const entities = this.world.getEntities(this.componentTypes);

    for (const entity of entities) {
      const position = entity.getComponent(Position);
      const loot = entity.getComponent(Loot);

      if (loot.dropped) {
        continue;
      }

      let temp = 0;

      const rand = Math.random();

      for (const drop of loot.drops) {
        temp += drop.chance;

        if (rand > temp) {
          continue;
        }

        const count = getRandomIntInclusive(drop.min, drop.max);

        for (let i = 0; i < count; i++) {
          if (drop.type !== "void") {
            const halfCone = degToRad(loot.scatter.angle / 2);

            const angle = -Math.PI / 2 + getRandomFloat(-1, 1) * halfCone;
            const dx = Math.cos(angle);
            const dy = Math.sin(angle);

            const x = position.x + dx;
            const y = position.y + dy;

            const dropEntity = this.world.spawn({ type: drop.type, components: { position: { x, y } } });

            const dropRb = dropEntity.getComponent(RigidBody);

            if (dropRb) {
              const dir = Vector2.create(dx, dy).normalize();
              dropRb.velocity.x += dir.x * loot.scatter.impulse.x;
              dropRb.velocity.y -= dir.y * loot.scatter.impulse.y;
            }
          }
        }

        break;
      }

      loot.dropped = true;

      entity.removeComponent(DeathEvent.COMPONENT_TYPE);
    }
  }
}
