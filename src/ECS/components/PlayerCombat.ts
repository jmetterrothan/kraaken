import Component from "@src/ECS/Component";

import { PLAYER_COMBAT_COMPONENT } from "@src/ECS/types";

import ProjectileWeapon from "@src/weapons/ProjectileWeapon";

export class PlayerCombat implements Component {
  public readonly type: symbol = PLAYER_COMBAT_COMPONENT;

  public usingPrimaryWeapon = false;
  public primary;

  private _weapon: ProjectileWeapon = new ProjectileWeapon({
    projectile: { type: "energy_bolt", speed: 275, ttl: 1000 }, //
    rate: 500,
    maxAmmo: 32,
    fireSFX: "laser",
    minRange: 16,
    maxRange: 80,
  });

  private _weapon2: ProjectileWeapon = new ProjectileWeapon({
    projectile: { type: "grenade", speed: 350, ttl: 10000 }, //
    rate: 75,
    maxAmmo: 32,
    fireSFX: "laser",
    minRange: 16,
    maxRange: 160,
  });

  public get primaryWeapon(): ProjectileWeapon {
    return this._weapon;
  }

  public get secondaryWeapon(): ProjectileWeapon {
    return this._weapon2;
  }

  public toString(): string {
    return `Player combat`;
  }
}
