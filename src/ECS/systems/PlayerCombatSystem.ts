import System from "@src/ECS/System";

import { PlayerInput, PlayerCombat } from "@src/ECS/components";

import { PLAYER_INPUT_COMPONENT, PLAYER_COMBAT_COMPONENT } from "@src/ECS/types";

export class PlayerCombatSystem extends System {
  public constructor() {
    super([PLAYER_INPUT_COMPONENT, PLAYER_COMBAT_COMPONENT]);
  }

  public execute(delta: number): void {
    const entities = this.world.getEntities(this.componentTypes);
    if (entities.length === 0) {
      return;
    }

    entities.forEach((entity) => {
      const combat = entity.getComponent<PlayerCombat>(PLAYER_COMBAT_COMPONENT);
      const input = entity.getComponent<PlayerInput>(PLAYER_INPUT_COMPONENT);

      if (input.usePrimary && combat.primaryWeapon) {
        combat.primaryWeapon.update(this.world, entity);
      }

      if (input.useSecondary && combat.secondaryWeapon) {
        combat.secondaryWeapon.update(this.world, entity);
      }
    });
  }
}
