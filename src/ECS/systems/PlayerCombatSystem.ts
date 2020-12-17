import { System }  from "@src/ECS";
import { PlayerInput, PlayerCombat } from "@src/ECS/components";

export class PlayerCombatSystem extends System {
  public constructor() {
    super([
      PlayerInput.COMPONENT_TYPE,
      PlayerCombat.COMPONENT_TYPE
    ]);
  }

  public execute(delta: number): void {
    const entities = this.world.getEntities(this.componentTypes);
    if (entities.length === 0) {
      return;
    }

    entities.forEach((entity) => {
      const input = entity.getComponent(PlayerInput);
      const combat = entity.getComponent(PlayerCombat);

      if (input.usePrimary && combat.primaryWeapon) {
        combat.primaryWeapon.update(this.world, entity);
      }
    });
  }
}
