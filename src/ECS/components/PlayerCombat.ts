import { Component } from "@src/ECS";

import ProjectileWeapon from "@src/weapons/ProjectileWeapon";

export class PlayerCombat implements Component {
  public static COMPONENT_TYPE = "player_combat";

  public usingPrimaryWeapon = false;
  public usingSecondaryWeapon = false;

  private _weapon1: ProjectileWeapon = new ProjectileWeapon({
    projectile: "energy_bolt", //
    rate: 600,
    burstLimit: 1,
    burstDelay: 200,
    maxAmmo: 32,
    fireSFX: "laser",
    fireFailSFX: "laser_fail",
    minRange: 16,
    maxRange: 72,
    spread: { x: 0, y: 0.01 },
  });

  private _weapon2: ProjectileWeapon = new ProjectileWeapon({
    projectile: "grenade", //
    rate: 60,
    burstLimit: 1,
    burstDelay: 1000,
    maxAmmo: 100,
    minRange: 24,
    maxRange: 240,
    spread: { x: 0.1, y: 0.1 },
  });

  public get primaryWeapon(): ProjectileWeapon {
    return this._weapon1;
  }

  public get secondaryWeapon(): ProjectileWeapon {
    return this._weapon2;
  }

  public toString(): string {
    return PlayerCombat.COMPONENT_TYPE;
  }
}
