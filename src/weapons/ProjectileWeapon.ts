import { Howl } from "howler";

import Entity from "@src/ECS/Entity";
import { Health, RigidBody, PlayerMovement, Position, BoundingBox } from "@src/ECS/components";
import { POSITION_COMPONENT, BOUNDING_BOX_COMPONENT, HEALTH_COMPONENT, PLAYER_MOVEMENT_COMPONENT, RIGID_BODY_COMPONENT } from "@src/ECS/types";

import World from "@src/world/World";
import Weapon from "@src/weapons/Weapon";

import Vector2 from "@shared/math/Vector2";

class ProjectileWeapon extends Weapon {
  public readonly projectile: {
    type: string;
    speed: number;
    ttl: number;
  };
  public readonly maxAmmo: number;
  public readonly rate: number;

  protected _ammo: number;

  protected nextTimeToFire: number;

  protected fireSoundFX: Howl;

  constructor({ projectile, rate = 0, maxAmmo = -1, fireSFX }) {
    super();

    if (!projectile) {
      throw new Error("No projectile setup");
    }

    // in rounds per minute
    this.projectile = projectile;
    this.rate = rate;
    this.maxAmmo = maxAmmo;

    this._ammo = this.maxAmmo;

    this.nextTimeToFire = 0;

    this.fireSoundFX = new Howl({
      src: fireSFX,
      autoplay: false,
      volume: 0.1,
    });
  }

  public update(world: World, owner: Entity) {
    if (!this.canBeUsed(owner)) {
      return;
    }

    const now = window.performance.now();

    if (now <= this.nextTimeToFire) {
      return;
    }

    if (this.rate === 0) {
      this.use(world, owner);
    } else if (now > this.nextTimeToFire && this.rate > 0) {
      // calculate delay in ms based on fire rate
      const delay = 60000 / this.rate;
      this.nextTimeToFire = now + delay;
      this.use(world, owner);
    }
  }

  protected use(world: World, owner: Entity) {
    const position = owner.getComponent<Position>(POSITION_COMPONENT);
    const bbox = owner.getComponent<BoundingBox>(BOUNDING_BOX_COMPONENT);

    const dx = world.aim.x >= position.x ? 1 : -1;
    const origin = new Vector2(position.x + (bbox.width / 2 + 4) * dx, position.y);
    const d = origin.clone().sub(world.aim).normalize().negate();

    const vx = this.projectile.speed * d.x;
    const vy = this.projectile.speed * d.y;

    const angle = Math.atan2(vy, vx);

    const projectile = world.spawn({ type: this.projectile.type, position: { x: origin.x, y: origin.y } });

    if (!projectile.hasComponent(POSITION_COMPONENT)) {
      throw new Error("Improper projectile entity (must have a position)");
    }
    if (!projectile.hasComponent(RIGID_BODY_COMPONENT)) {
      throw new Error("Improper projectile entity (must have a rigid body)");
    }

    const projectilePos = projectile.getComponent<Position>(POSITION_COMPONENT);
    const projectileRigidBody = projectile.getComponent<RigidBody>(RIGID_BODY_COMPONENT);

    projectilePos.rotation = angle;
    projectileRigidBody.velocity.fromValues(vx, vy);

    this.ammo -= 1;

    this.fireSoundFX.play();

    if (this.projectile.ttl !== -1) {
      setTimeout(() => {
        world.removeEntity(projectile);
      }, this.projectile.ttl);
    }
  }

  public canBeUsed(entity: Entity): boolean {
    const health = entity.getComponent<Health>(HEALTH_COMPONENT);
    const movement = entity.getComponent<PlayerMovement>(PLAYER_MOVEMENT_COMPONENT);
    const rigidBody = entity.getComponent<RigidBody>(RIGID_BODY_COMPONENT);

    return (this.ammo > 0 || this.maxAmmo === -1) && health.isAlive && movement.isGrounded && Math.abs(rigidBody.velocity.x) < movement.speed;
  }

  public get ammo(): number {
    return this._ammo;
  }

  public set ammo(amount: number) {
    this._ammo = amount;

    if (this._ammo < 0) {
      this._ammo = 0;
    }
    if (this._ammo > this.maxAmmo) {
      this._ammo = this.maxAmmo;
    }
  }
}

export default ProjectileWeapon;
