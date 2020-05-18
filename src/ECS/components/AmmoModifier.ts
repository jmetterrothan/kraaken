import Entity from "@src/ECS/Entity";

import { Consummable, PlayerCombat } from "@src/ECS/components";
import { BOUNDING_BOX_COMPONENT, CONSUMMABLE_COMPONENT, PLAYER_COMBAT_COMPONENT } from "@src/ECS/types";

import World from "@src/world/World";

export class AmmoModifier extends Consummable {
  public readonly symbol: symbol = CONSUMMABLE_COMPONENT;

  public readonly amount: number;

  public constructor(metadata = {}) {
    super(metadata);
  }

  public consummatedBy(world: World, entity: Entity): void {
    const combat = entity.getComponent<PlayerCombat>(PLAYER_COMBAT_COMPONENT);

    combat.weapon.ammo = combat.weapon.maxAmmo;
  }

  public canBeConsummatedBy(entity: Entity): boolean {
    if (!entity.hasComponent(PLAYER_COMBAT_COMPONENT)) {
      return false;
    }

    const combat = entity.getComponent<PlayerCombat>(PLAYER_COMBAT_COMPONENT);
    return combat.weapon.ammo < combat.weapon.maxAmmo && combat.weapon.maxAmmo !== -1;
  }

  public getComponentTypes(): symbol[] {
    return [PLAYER_COMBAT_COMPONENT, BOUNDING_BOX_COMPONENT];
  }
}