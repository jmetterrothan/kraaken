import { System, Entity } from "@src/ECS";

import { PlayerInput, Position, PlayerCombat, Health } from "@src/ECS/components";

import { buttonPressed } from "@src/shared/utility/Utility";

import Vector2 from "@src/shared/math/Vector2";

import World from "@src/world/World";

import keyBindings, { matchKeyBinding } from "@src/keyBindings";
import mouseBindings, { matchMouseBinding } from "@src/mouseBindings";
import gamepadBindings, { matchGamepadBinding } from "@src/gamepadBindings";

export class PlayerInputSystem extends System {
  public constructor() {
    super([Position.COMPONENT_TYPE, PlayerInput.COMPONENT_TYPE, PlayerCombat.COMPONENT_TYPE, Health.COMPONENT_TYPE]);
  }

  public handleMouseMove(_e: MouseEvent, coords: Vector2): void {
    const entities = this.world.getEntities(this.componentTypes);

    if (entities.length === 0) {
      return;
    }

    entities.forEach((entity) => {
      const health = entity.getComponent(Health);

      if (health.isAlive) {
        const position = entity.getComponent(Position);
        const input = entity.getComponent(PlayerInput);

        const c = Vector2.create(coords.x - position.x, coords.y - position.y);
        input.aim.lerp(c, 0.2);
        Vector2.destroy(c);
      }
    });
  }

  public handleMouseInput(e: MouseEvent, active: boolean, _position: Vector2): void {
    const entities = this.world.getEntities(this.componentTypes);
    if (entities.length === 0) {
      return;
    }

    entities.forEach((entity) => {
      if (this.world.controlledEntity === entity) {
        const input = entity.getComponent(PlayerInput);
        const health = entity.getComponent(Health);

        if (matchMouseBinding(mouseBindings.level.fire, e)) {
          input.attack = active && health.isAlive;
        }
      }
    });
  }

  public handleKeyboardInput(e: KeyboardEvent, active: boolean): void {
    const entities = this.world.getEntities(this.componentTypes);
    if (entities.length === 0) {
      return;
    }

    entities.forEach((entity) => {
      if (this.world.controlledEntity === entity) {
        const health = entity.getComponent(Health);
        const input = entity.getComponent(PlayerInput);

        if (matchKeyBinding(keyBindings.level.attack, e)) {
          input.attack = active && health.isAlive;
        } else if (matchKeyBinding(keyBindings.level.left, e)) {
          input.left = active && health.isAlive;
        } else if (matchKeyBinding(keyBindings.level.right, e)) {
          input.right = active && health.isAlive;
        } else if (matchKeyBinding(keyBindings.level.up, e)) {
          input.up = active && health.isAlive;
        } else if (matchKeyBinding(keyBindings.level.down, e)) {
          input.down = active && health.isAlive;
        } else if (matchKeyBinding(keyBindings.level.jump, e)) {
          input.jump = active && health.isAlive;
        } else if (matchKeyBinding(keyBindings.level.dash, e)) {
          input.dash = active && health.isAlive;
        } else if (matchKeyBinding(keyBindings.level.grab, e)) {
          input.grab = active && health.isAlive;
        }
      }
    });
  }

  handleGamepadInput(entity: Entity, controllers: Gamepad[], delta: number): void {
    const input = entity.getComponent(PlayerInput);
    const health = entity.getComponent(Health);

    const controller = controllers[input.gamepadIndex];

    if (controller && controller.connected) {
      const lx = controller.axes[0] ?? 0;
      const ly = controller.axes[1] ?? 0;

      const deadzone = 0.25;

      // set from stick first
      input.left = health.isAlive && lx < -deadzone;
      input.right = health.isAlive && lx > deadzone;
      input.up = health.isAlive && ly < -deadzone;
      input.down = health.isAlive && ly > deadzone;

      const rx = controller.axes[2] ?? 0;
      const ry = controller.axes[3] ?? 0;

      if (health.isAlive && (Math.abs(rx) >= 0.15 || Math.abs(ry) >= 0.15)) {
        input.aim.x += rx * 450 * delta;
        input.aim.y += ry * 450 * delta;
      }
      // handle buttons
      controller.buttons.forEach((button, index) => {
        const active = buttonPressed(button);

        if (matchGamepadBinding(gamepadBindings.level.attack, index)) {
          input.attack = active && health.isAlive;
        } else if (matchGamepadBinding(gamepadBindings.level.left, index)) {
          input.left = active && health.isAlive;
        } else if (matchGamepadBinding(gamepadBindings.level.right, index)) {
          input.right = active && health.isAlive;
        } else if (matchGamepadBinding(gamepadBindings.level.up, index)) {
          input.up = active && health.isAlive;
        } else if (matchGamepadBinding(gamepadBindings.level.down, index)) {
          input.down = active && health.isAlive;
        } else if (matchGamepadBinding(gamepadBindings.level.jump, index)) {
          input.jump = active && health.isAlive;
        } else if (matchGamepadBinding(gamepadBindings.level.grab, index)) {
          input.grab = active && health.isAlive;
        } else if (matchGamepadBinding(gamepadBindings.level.dash, index)) {
          input.dash = active && health.isAlive;
        }
      });
    }
  }

  enforceWeaponRangeLimit(entity: Entity): void {
    const input = entity.getComponent(PlayerInput);
    const combat = entity.getComponent(PlayerCombat);

    const origin = Vector2.create(0, 0);
    const dist = origin.distanceTo(input.aim);
    Vector2.destroy(origin);

    if (typeof combat.primaryWeapon.maxRange !== "undefined") {
      if (dist > combat.primaryWeapon.maxRange) {
        const v = input.aim.clone().multiplyScalar((combat.primaryWeapon.maxRange - 0.01) / dist);
        input.aim.fromValues(v.x, v.y);
        Vector2.destroy(v);
      }

      if (dist < combat.primaryWeapon.minRange) {
        const v = input.aim.clone().multiplyScalar((combat.primaryWeapon.minRange + 0.01) / dist);
        input.aim.fromValues(v.x, v.y);
        Vector2.destroy(v);
      }
    }
  }

  execute(delta: number): void {
    if (!this.world) {
      return;
    }

    const controllers = ("getGamepads" in navigator ? navigator.getGamepads() : []).filter((gamepad) => gamepad !== null);

    if (this.world.controlledEntity) {
      const input = this.world.controlledEntity.getComponent(PlayerInput);

      input.grabPressed = input.grab && !input.prevGrab;
      input.prevGrab = input.grab;

      input.jumpPressed = input.jump && !input.prevJump;
      input.prevJump = input.jump;

      input.attackPressed = input.attack && !input.prevAttack;
      input.prevAttack = input.attack;

      input.dashPressed = input.dash && !input.prevDash;
      input.prevDash = input.dash;

      this.handleGamepadInput(this.world.controlledEntity, controllers, delta);
      this.enforceWeaponRangeLimit(this.world.controlledEntity);
    }
  }

  public removedFromWorld(world: World): void {
    super.removedFromWorld(world);
  }
}
