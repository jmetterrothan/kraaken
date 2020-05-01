import World from "@src/world/World";
import Entity from "@src/objects/entity/Entity";
import Projectile from "@src/objects/entity/Projectile";

class ProjectileWeapon {
  protected rate: number;
  protected firePoint: Entity;

  protected nextTimeToFire: number;

  constructor(rate: number, firePoint: Entity) {
    // in rounds per minute
    this.rate = rate;
    this.firePoint = firePoint;

    this.nextTimeToFire = 0;
  }

  public update(world: World) {
    const now = window.performance.now();

    if (this.rate === 0) {
      this.fire(world);
    } else if (now > this.nextTimeToFire && this.rate > 0) {
      // calculate delay in ms based on fire rate
      const delay = (60 * 1000) / this.rate;
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
        bbox: { w: 6, h: 6 },
        collide: false,
        gravity: false,
        speed: { x: 3500, y: 0 },
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

    world.add(projectile);
  }
}

export default ProjectileWeapon;
