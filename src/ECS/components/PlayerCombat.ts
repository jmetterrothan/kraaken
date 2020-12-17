import { Component } from "@src/ECS";

import ProjectileWeapon from "@src/weapons/ProjectileWeapon";

export class PlayerCombat implements Component {
  public static COMPONENT_TYPE = "player_combat";

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
    return PlayerCombat.COMPONENT_TYPE;
  }
}
