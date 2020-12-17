import { Entity } from '@src/ECS';

import { Consummable, PlayerCombat, BoundingBox } from "@src/ECS/components";

import World from "@src/world/World";

export class AmmoModifier extends Consummable {
  public readonly amount: number;

  public constructor(metadata = {}) {
    super(metadata);
  }

  public consummatedBy(world: World, entity: Entity): void {
    super.consummatedBy(world, entity);

    const combat = entity.getComponent(PlayerCombat);

    combat.primaryWeapon.ammo = combat.primaryWeapon.maxAmmo;

    if (this.pickUpSFX) {
      this.pickUpSFX.play();
    }
  }

  public canBeConsummatedBy(entity: Entity): boolean {
    if (!super.canBeConsummatedBy(entity)) {
      return false;
    }
    
    if (!entity.hasComponent(PlayerCombat.COMPONENT_TYPE)) {
      return false;
    }

    const combat = entity.getComponent(PlayerCombat);
    return combat.primaryWeapon.ammo < combat.primaryWeapon.maxAmmo && combat.primaryWeapon.maxAmmo !== -1;
  }

  public getComponentTypes(): string[] {
    return [PlayerCombat.COMPONENT_TYPE, BoundingBox.COMPONENT_TYPE];
  }
}
