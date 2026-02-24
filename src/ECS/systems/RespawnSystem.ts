import { System } from "@src/ECS";
import { Checkpoint, Health, Position, RespawnEvent, RigidBody } from "@src/ECS/components";

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

      const checkpoint = entity.getComponent(Checkpoint);

      if (!checkpoint) {
        const spawnPoint = this.world.levelBlueprint.spawnPoints.find(({ uuid }) => uuid === entity.uuid);

        pos.x = spawnPoint?.components?.position?.x ?? 0;
        pos.y = spawnPoint?.components?.position?.y ?? 0;

        if (rb) {
          rb.direction.x = spawnPoint?.components?.rigid_body?.direction?.x ?? 1;
          rb.direction.y = spawnPoint?.components?.rigid_body?.direction?.y ?? 1;
        }
      } else {
        pos.x = checkpoint.moveTo.x;
        pos.y = checkpoint.moveTo.y;

        if (rb) {
          rb.direction.x = checkpoint.lookAt.y;
          rb.direction.y = checkpoint.lookAt.y;
        }
      }

      health.value = health.maxHealth;

      health.immunity = true;
      health.remainingImmunityMs = health.immunityDelay;

      entity.removeComponent(RespawnEvent.COMPONENT_TYPE);
    }
  }
}
