import { Howl, Howler } from "howler";

import World from "@src/world/World";
import Entity from "@src/objects/entity/Entity";
import Projectile from "@src/objects/entity/Projectile";

import fireEnergyBoltSoundFX from "@src/data/level1/assets/sounds/laser.wav";

class ProjectileWeapon {
  protected rate: number;
  protected firePoint: Entity;

  protected nextTimeToFire: number;

  protected fireSoundFX: Howl;

  constructor(rate: number, firePoint: Entity) {
    // in rounds per minute
    this.rate = rate;
    this.firePoint = firePoint;

    this.nextTimeToFire = 0;

    this.fireSoundFX = new Howl({
      src: fireEnergyBoltSoundFX,
      autoplay: false,
      volume: 0.1,
    });
  }

  public update(world: World) {
    const now = window.performance.now();

    if (this.rate === 0) {
      this.fire(world);
    } else if (now > this.nextTimeToFire && this.rate > 0) {
      // calculate delay in ms based on fire rate
      const delay = 60000 / this.rate;
      this.nextTimeToFire = now + delay;
      this.fire(world);
    }
  }

  private fire(world: World) {
    const bbox = this.firePoint.getBbox();

    const d = this.firePoint.getDirection().setY(1);
    const x = this.firePoint.getX() + (bbox.getWidth() / 2 + 4) * d.x;
    const y = this.firePoint.getY();

    const projectile = new Projectile(x, y, d, {
      id: "energy_bolt",
      type: "projectile",
      metadata: {
        bbox: { w: 0, h: 0 },
        speed: { x: 3500, y: 0 },
        damage: 4,
        collide: true,
        gravity: false,
      },
      defaultAnimationKey: "default",
      animationList: {
        default: {
          sprite: "items",
          loop: true,
          keyframes: [
            { row: 2, col: 0, duration: 75 },
            { row: 2, col: 1, duration: 75 },
            { row: 2, col: 2, duration: 75 },
          ],
        },
        hit: {
          sprite: "items",
          loop: false,
          keyframes: [{ row: 2, col: 3, duration: 150 }],
        },
      },
    });

    this.fireSoundFX.play();

    world.add(projectile);
  }
}

export default ProjectileWeapon;
