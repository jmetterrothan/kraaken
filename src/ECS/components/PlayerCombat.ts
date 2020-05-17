import Component from "@src/ECS/Component";

import { PLAYER_COMBAT_COMPONENT } from "@src/ECS/types";

import ProjectileWeapon from "@src/weapons/ProjectileWeapon";

import fireEnergyBoltSoundFX from "@src/data/level1/assets/sounds/laser.wav";

export class PlayerCombat implements Component {
  public readonly type: symbol = PLAYER_COMBAT_COMPONENT;

  public usingPrimaryWeapon: boolean = false;

  public weapon: ProjectileWeapon = new ProjectileWeapon({
    projectile: { type: "energy_bolt", speed: 225, ttl: 1000 }, //
    rate: 500,
    maxAmmo: 32,
    fireSFX: fireEnergyBoltSoundFX,
  });

  public toString(): string {
    return `Player combat`;
  }
}
