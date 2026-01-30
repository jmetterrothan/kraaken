import { Entity } from "@src/ECS";
import { Projectile, Health, RigidBody, Movement, Position, PlayerInput, BoundingBox, Camera } from "@src/ECS/components";

import World from "@src/world/World";
import Weapon from "@src/weapons/Weapon";

import SoundManager from "@src/animation/SoundManager";

import Vector2 from "@src/shared/math/Vector2";
import { IVector2 } from "@src/shared/models/event.model";

interface ProjectileWeaponOptions {
  projectile?: string;
  rate?: number;
  maxAmmo?: number;
  minRange?: number;
  maxRange?: number;
  fireSFX?: string;
  fireFailSFX?: string;
  burstLimit?: number;
  burstDelay?: number;
  spread?: IVector2;
}

class ProjectileWeapon extends Weapon {
  public readonly projectile: string;
  public readonly maxAmmo: number;
  public readonly rate: number;
  public readonly minRange: number;
  public readonly maxRange: number;
  public readonly burstLimit: number;
  public readonly burstDelay: number;
  public readonly spread: Vector2;

  protected _ammo: number;

  protected nextShotAt = 0;
  protected nextBurstAt = 0;
  protected shotsLeftInBurst: number;

  protected fireSFX: Howl | undefined;
  protected fireFailSFX: Howl | undefined;

  protected lastFireFailAt: number = 0;

  constructor({ projectile, rate = 0, burstLimit = 1, burstDelay = 0, maxAmmo = -1, minRange = -1, maxRange = -1, spread, fireSFX, fireFailSFX }: ProjectileWeaponOptions) {
    super();

    if (!projectile) {
      throw new Error("No projectile entity type specified");
    }

    if (burstLimit < 1) {
      throw new Error("Burst limit cannot be inferior to 1");
    }

    // in rounds per minute
    this.projectile = projectile;
    this.rate = rate;
    this.burstLimit = burstLimit;
    this.burstDelay = burstDelay;
    this.maxAmmo = maxAmmo;
    this.minRange = minRange;
    this.maxRange = maxRange;
    this.spread = Vector2.create(spread?.x ?? 0, spread?.y ?? 0);

    this._ammo = this.maxAmmo;

    this.shotsLeftInBurst = this.burstLimit;

    if (fireSFX) {
      this.fireSFX = SoundManager.create(fireSFX, {
        autoplay: false,
        volume: 0.1,
      });
    }

    if (fireFailSFX) {
      this.fireFailSFX = SoundManager.create(fireFailSFX, {
        autoplay: false,
        volume: 0.1,
      });
    }
  }

  public update(world: World, owner: Entity): void {
    const now = window.performance.now();

    if (!this.canBeUsed(world, owner)) {
      return;
    }

    const shotIntervalMs = this.rate > 0 ? 60000 / this.rate : 0;

    if (now < this.nextBurstAt || (shotIntervalMs > 0 && now < this.nextShotAt)) {
      return;
    }

    if (!this.hasAmmo()) {
      this.shotsLeftInBurst = this.burstLimit;

      if (this.fireFailSFX && now - this.lastFireFailAt > 250) {
        this.fireFailSFX.play();

        this.lastFireFailAt = now;
      }
      return;
    }

    this.use(world, owner);

    if (shotIntervalMs > 0) {
      this.nextShotAt = now + shotIntervalMs;
    }

    this.shotsLeftInBurst -= 1;

    if (this.shotsLeftInBurst <= 0) {
      this.nextBurstAt = now + this.burstDelay;
      this.nextShotAt = this.nextBurstAt;
      this.shotsLeftInBurst = this.burstLimit;
    }
  }

  protected use(world: World, owner: Entity): void {
    const position = owner.getComponent(Position);
    const bbox = owner.getComponent(BoundingBox);
    const rigidBody = owner.getComponent(RigidBody);
    const playerInput = owner.getComponent(PlayerInput);

    const target = position.clone().add(playerInput.aim);
    const origin = Vector2.create(position.x + (bbox.width / 2 + 8) * rigidBody.orientation.x, position.y);
    const dir = origin.clone().sub(target).normalize().negate();

    // apply spread
    if (this.spread.x !== 0 || this.spread.y !== 0) {
      dir.x += (Math.random() * 2 - 1) * this.spread.x;
      dir.y += (Math.random() * 2 - 1) * this.spread.y;
      dir.normalize();
    }

    const projectile = world.spawn({ type: this.projectile, position: { x: origin.x, y: origin.y } });

    if (!projectile.hasComponent(Projectile.COMPONENT_TYPE)) {
      throw new Error("Improper projectile entity (must have a projectile component)");
    }

    const { speed, ttl } = projectile.getComponent(Projectile);

    const vx = speed * dir.x;
    const vy = speed * dir.y;

    if (!projectile.hasComponent(Position.COMPONENT_TYPE)) {
      throw new Error("Improper projectile entity (must have a position component)");
    }
    if (!projectile.hasComponent(RigidBody.COMPONENT_TYPE)) {
      throw new Error("Improper projectile entity (must have a rigid body component)");
    }

    const projectilePos = projectile.getComponent(Position);
    const projectileRigidBody = projectile.getComponent(RigidBody);

    if (projectileRigidBody.reflectAngle) {
      const angle = Math.atan2(vy, vx);

      projectilePos.rotation = angle;
    }

    projectileRigidBody.velocity.fromValues(vx, vy);

    if (this.maxAmmo !== -1) {
      this.ammo -= 1;
    }

    if (this.fireSFX) {
      this.fireSFX.play();
    }

    world.camera.getComponent(Camera).shakeOnce(4, 100);

    if (playerInput && "vibrate" in navigator) {
      const gamepads = "getGamepads" in navigator ? navigator.getGamepads() : [];
      const gamepad = gamepads[playerInput.gamepadIndex] as any;

      if (gamepad && gamepad.vibrationActuator) {
        /*
         * TODO: Check on gamepad API evolution, only works on Chrome
         * Should be using an intermediate interface here to regroup all browser implementations
         */
        gamepad.vibrationActuator.playEffect("dual-rumble", {
          startDelay: 100,
          duration: 150,
          weakMagnitude: 0.75,
          strongMagnitude: 1.0,
        });
      }
    }

    if (ttl !== -1) {
      setTimeout(() => {
        if (world) {
          world.removeEntity(projectile);
        }
      }, ttl);
    }

    Vector2.destroy(target);
    Vector2.destroy(origin);
    Vector2.destroy(dir);
  }

  public hasAmmo() {
    return this.ammo > 0 || this.maxAmmo === -1;
  }

  public canBeUsed(world: World, owner: Entity): boolean {
    const position = owner.getComponent(Position);
    const bbox = owner.getComponent(BoundingBox);
    const health = owner.getComponent(Health);
    const movement = owner.getComponent(Movement);
    const rigidBody = owner.getComponent(RigidBody);
    const playerInput = owner.getComponent(PlayerInput);

    // caculate origin of the projectile and recover the tile at this position
    const tile = world.tileMap.getTileAtCoords(position.x + (bbox.width / 2 + 8) * rigidBody.orientation.x, position.y);

    // test if the spawn position of the projectile is not in a solid tile
    if (!tile || tile.hasCollision()) {
      return false;
    }

    const target = position.clone().add(playerInput.aim);
    const dist = position.distanceTo(target);
    Vector2.destroy(target);

    if (this.minRange !== -1 && dist < this.minRange) {
      return false;
    }
    if (this.maxRange !== -1 && dist > this.maxRange) {
      return false;
    }

    return health.isAlive && rigidBody.isGrounded && Math.abs(rigidBody.velocity.x) < movement.speed;
  }

  public get ammo(): number {
    return this._ammo;
  }

  public set ammo(amount: number) {
    this._ammo = amount;

    if (this._ammo < 0) {
      this._ammo = 0;
    }

    if (this.maxAmmo !== -1 && this._ammo > this.maxAmmo) {
      this._ammo = this.maxAmmo;
    }
  }
}

export default ProjectileWeapon;
