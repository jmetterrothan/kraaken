import { System, Entity } from "@src/ECS";

import { PlayerInput, Position, PlayerCombat, Health } from "@src/ECS/components";

import { buttonPressed } from "@src/shared/utility/Utility";

import Vector2 from "@src/shared/math/Vector2";

import World from "@src/world/World";

import { vec2 } from "gl-matrix";
import keyBindings, { matchKeyBinding } from "@src/keyBindings";
import mouseBindings, { matchMouseBinding } from "@src/mouseBindings";
import gamepadBindings, { matchGamepadBinding } from "@src/gamepadBindings";

export class PlayerInputSystem extends System {
  public constructor() {
    super([Position.COMPONENT_TYPE, PlayerInput.COMPONENT_TYPE, PlayerCombat.COMPONENT_TYPE, Health.COMPONENT_TYPE]);
  }

  public handleMouseMove(coords: Vector2): void {
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

  public handleMouseInput(e: MouseEvent, active: boolean, _position: vec2): void {
    const entities = this.world.getEntities(this.componentTypes);
    if (entities.length === 0) {
      return;
    }

    entities.forEach((entity) => {
      if (this.world.controlledEntity === entity) {
        const input = entity.getComponent(PlayerInput);
        const health = entity.getComponent(Health);

        if (matchMouseBinding(mouseBindings.level.fire, e)) {
          input.usePrimary = active && health.isAlive;
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

        if (matchKeyBinding(keyBindings.level.usePrimaryWeapon, e)) {
          input.usePrimary = active && health.isAlive;
        } else if (matchKeyBinding(keyBindings.level.useSecondaryWeapon, e)) {
          input.useSecondary = active && health.isAlive;
        } else if (matchKeyBinding(keyBindings.level.left, e)) {
          input.left = active && health.isAlive;
        } else if (matchKeyBinding(keyBindings.level.right, e)) {
          input.right = active && health.isAlive;
        } else if (matchKeyBinding(keyBindings.level.up, e)) {
          input.up = active && health.isAlive;
        } else if (matchKeyBinding(keyBindings.level.down, e)) {
          input.down = active && health.isAlive;
        }
      }
    });
  }

  handleGamepadInput(entity: Entity, controllers: Gamepad[], delta: number): void {
    const input = entity.getComponent(PlayerInput);
    const health = entity.getComponent(Health);

    const controller = controllers[input.gamepadIndex];

    if (controller && controller.connected) {
      const x = controller.axes[0];
      const y = controller.axes[1];

      if (!input.hold && health.isAlive) {
        if (x >= 0.5) {
          input.right = true;
        } else {
          input.right = false;
        }

        if (x <= -0.5) {
          input.left = true;
        } else {
          input.left = false;
        }
      } else {
        input.left = false;
        input.right = false;
      }

      input.aim.x += health.isAlive && Math.abs(x) >= 0.15 ? x * 450 * delta : 0;
      input.aim.y += health.isAlive && Math.abs(y) >= 0.15 ? y * 450 * delta : 0;

      // handle buttons
      controller.buttons.forEach((button, index) => {
        const active = buttonPressed(button);

        if (matchGamepadBinding(gamepadBindings.level.usePrimaryWeapon, index)) {
          input.usePrimary = active && health.isAlive;
        } else if (matchGamepadBinding(gamepadBindings.level.useSecondaryWeapon, index)) {
          input.useSecondary = active && health.isAlive;
        } else if (matchGamepadBinding(gamepadBindings.level.jump, index)) {
          input.up = active && health.isAlive;
        } else if (matchGamepadBinding(gamepadBindings.level.hold, index)) {
          input.hold = active && health.isAlive;
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
      this.handleGamepadInput(this.world.controlledEntity, controllers, delta);
      this.enforceWeaponRangeLimit(this.world.controlledEntity);
    }
  }

  public removedFromWorld(world: World): void {
    super.removedFromWorld(world);
  }
}
