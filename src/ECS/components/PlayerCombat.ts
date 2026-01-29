import { Component } from "@src/ECS";

import ProjectileWeapon from "@src/weapons/ProjectileWeapon";

export class PlayerCombat implements Component {
  public static COMPONENT_TYPE = "player_combat";

  public usingPrimaryWeapon = false;

  private _weapon: ProjectileWeapon = new ProjectileWeapon({
    projectile: "energy_bolt", //
    rate: 375,
    burstLimit: 1,
    burstDelay: 200,
    maxAmmo: 12,
    fireSFX: "laser",
    fireFailSFX: "laser_fail",
    minRange: 16,
    maxRange: 72,
    spread: { x: 0, y: 0.01 },
  });

  public get primaryWeapon(): ProjectileWeapon {
    return this._weapon;
  }

  public toString(): string {
    return PlayerCombat.COMPONENT_TYPE;
  }
}
