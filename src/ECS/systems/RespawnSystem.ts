import { System } from "@src/ECS";
import { Health, Position, RespawnEvent, RigidBody } from "@src/ECS/components";

export class RespawnSystem extends System {
  constructor() {
    super([RespawnEvent.COMPONENT_TYPE, Health.COMPONENT_TYPE, Position.COMPONENT_TYPE]);
  }

  execute(_delta: number): void {
    const entities = this.world.getEntities(this.componentTypes);

    for (const entity of entities) {
      const health = entity.getComponent(Health);
      const rb = entity.getComponent(RigidBody);
      const pos = entity.getComponent(Position);

      const spawnPoint = this.world.levelBlueprint.spawnPoints.find(({ uuid }) => uuid === entity.uuid);

      pos.x = spawnPoint?.position?.x ?? 0;
      pos.y = spawnPoint?.position?.y ?? 0;

      if (rb) {
        rb.direction.x = spawnPoint?.direction?.x ?? 0;
        rb.direction.y = spawnPoint?.direction?.y ?? 0;
      }

      health.value = health.maxHealth;

      entity.removeComponent(RespawnEvent.COMPONENT_TYPE);
    }
  }
}
