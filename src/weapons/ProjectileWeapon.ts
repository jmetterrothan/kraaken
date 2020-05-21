import Entity from "@src/ECS/Entity";
import { Health, RigidBody, PlayerMovement, Position, PlayerInput, BoundingBox } from "@src/ECS/components";
import { POSITION_COMPONENT, BOUNDING_BOX_COMPONENT, HEALTH_COMPONENT, PLAYER_INPUT_COMPONENT, PLAYER_MOVEMENT_COMPONENT, RIGID_BODY_COMPONENT } from "@src/ECS/types";

import World from "@src/world/World";
import Weapon from "@src/weapons/Weapon";

import SoundManager from "@src/animation/SoundManager";

import Vector2 from "@shared/math/Vector2";

class ProjectileWeapon extends Weapon {
  public readonly projectile: {
    type: string;
    speed: number;
    ttl: number;
  };
  public readonly maxAmmo: number;
  public readonly rate: number;
  public readonly minRange: number;
  public readonly maxRange: number;

  protected _ammo: number;

  protected nextTimeToFire: number;

  protected fireSFX: Howl | undefined;

  constructor({ projectile, rate = 0, maxAmmo = -1, minRange = -1, maxRange = -1, fireSFX }) {
    super();

    if (!projectile) {
      throw new Error("No projectile setup");
    }

    // in rounds per minute
    this.projectile = projectile;
    this.rate = rate;
    this.maxAmmo = maxAmmo;
    this.minRange = minRange;
    this.maxRange = maxRange;

    this._ammo = this.maxAmmo;

    this.nextTimeToFire = 0;

    if (fireSFX) {
      this.fireSFX = SoundManager.create(fireSFX, {
        autoplay: false,
        volume: 0.1,
      });
    }
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
    const rigidBody = owner.getComponent<RigidBody>(RIGID_BODY_COMPONENT);
    const playerInput = owner.getComponent<PlayerInput>(PLAYER_INPUT_COMPONENT);

    const target = position.clone().add(playerInput.aim);
    const origin = new Vector2(position.x + (bbox.width / 2 + 4) * rigidBody.orientation.x, position.y);
    const dir = origin.clone().sub(target).normalize().negate();

    const vx = this.projectile.speed * dir.x;
    const vy = this.projectile.speed * dir.y;

    const projectile = world.spawn({ type: this.projectile.type, position: { x: origin.x, y: origin.y } });

    if (!projectile.hasComponent(POSITION_COMPONENT)) {
      throw new Error("Improper projectile entity (must have a position)");
    }
    if (!projectile.hasComponent(RIGID_BODY_COMPONENT)) {
      throw new Error("Improper projectile entity (must have a rigid body)");
    }

    const projectilePos = projectile.getComponent<Position>(POSITION_COMPONENT);
    const projectileRigidBody = projectile.getComponent<RigidBody>(RIGID_BODY_COMPONENT);

    if (projectileRigidBody.reflectAngle) {
      const angle = Math.atan2(vy, vx);

      projectilePos.rotation = angle;
    }

    projectileRigidBody.velocity.fromValues(vx, vy);

    this.ammo -= 1;

    if (this.fireSFX) {
      this.fireSFX.play();
    }

    if (playerInput && "vibrate" in navigator) {
      const gamepads = "getGamepads" in navigator ? navigator.getGamepads() : [];
      const gamepad = gamepads[playerInput.gamepadIndex];

      if (gamepad) {
        gamepad.vibrationActuator.playEffect("dual-rumble", {
          startDelay: 100,
          duration: 150,
          weakMagnitude: 0.75,
          strongMagnitude: 1.0,
        });
      }
    }

    if (this.projectile.ttl !== -1) {
      setTimeout(() => {
        world.removeEntity(projectile);
      }, this.projectile.ttl);
    }
  }

  public canBeUsed(owner: Entity): boolean {
    const position = owner.getComponent<Position>(POSITION_COMPONENT);
    const health = owner.getComponent<Health>(HEALTH_COMPONENT);
    const movement = owner.getComponent<PlayerMovement>(PLAYER_MOVEMENT_COMPONENT);
    const rigidBody = owner.getComponent<RigidBody>(RIGID_BODY_COMPONENT);
    const playerInput = owner.getComponent<PlayerInput>(PLAYER_INPUT_COMPONENT);

    const target = position.clone().add(playerInput.aim);
    const dist = position.distanceTo(target);

    if (this.minRange !== -1 && dist < this.minRange) {
      return false;
    }
    if (this.maxRange !== -1 && dist > this.maxRange) {
      return false;
    }

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
