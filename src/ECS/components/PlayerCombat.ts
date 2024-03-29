import Component from "@src/ECS/Component";

import { PLAYER_COMBAT_COMPONENT } from "@src/ECS/types";

import ProjectileWeapon from "@src/weapons/ProjectileWeapon";

export class PlayerCombat implements Component {
  public readonly type: symbol = PLAYER_COMBAT_COMPONENT;

  public usingPrimaryWeapon = false;
  public primary;

  private _weapon: ProjectileWeapon = new ProjectileWeapon({
    projectile: "energy_bolt", //
    rate: 350,
    burstLimit: 1,
    burstDelay: 0,
    maxAmmo: 100,
    fireSFX: "laser",
    minRange: 16,
    maxRange: 80,
  });

  public get primaryWeapon(): ProjectileWeapon {
    return this._weapon;
  }

  public toString(): string {
    return `Player combat`;
  }
}
