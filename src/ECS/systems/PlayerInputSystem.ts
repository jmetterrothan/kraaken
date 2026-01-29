import { System, Entity } from "@src/ECS";

import { PlayerInput, Position, PlayerCombat, Health } from "@src/ECS/components";

import { buttonPressed } from "@src/shared/utility/Utility";

import Vector2 from "@src/shared/math/Vector2";

import config from "@src/config";
import World from "@src/world/World";
import MouseButton from "@src/enums/MouseButton";

export class PlayerInputSystem extends System {
  protected gamepads: Record<number, Gamepad> = {};

  public constructor() {
    super([Position.COMPONENT_TYPE, PlayerInput.COMPONENT_TYPE, PlayerCombat.COMPONENT_TYPE, Health.COMPONENT_TYPE]);

    // Gamepad events
    window.addEventListener(
      "gamepadconnected",
      (e: GamepadEvent) => {
        this.handleGamepad(e, true);
      },
      false
    );

    window.addEventListener(
      "gamepaddisconnected",
      (e: GamepadEvent) => {
        this.handleGamepad(e, false);
      },
      false
    );
  }

  public handleGamepad(e: GamepadEvent, connecting: boolean): void {
    const gamepad = e.gamepad;

    if (connecting) {
      if (config.DEBUG) console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.", e.gamepad.index, e.gamepad.id, e.gamepad.buttons.length, e.gamepad.axes.length);

      this.gamepads[gamepad.index] = gamepad;
    } else {
      delete this.gamepads[gamepad.index];
    }
  }

  public handleMouseMove(coords: Vector2): void {
    const entities = this.world.getEntities(this.componentTypes);

    if (entities.length === 0) {
      return;
    }

    entities.forEach((entity) => {
      const position = entity.getComponent(Position);
      const health = entity.getComponent(Health);
      const input = entity.getComponent(PlayerInput);

      if (health.isAlive) {
        const c = Vector2.create(coords.x - position.x, coords.y - position.y);
        input.aim.lerp(c, 0.2);
        Vector2.destroy(c);
      }
    });
  }

  public handleMouseInput(button: MouseButton, active: boolean): void {
    const entities = this.world.getEntities(this.componentTypes);
    if (entities.length === 0) {
      return;
    }

    entities.forEach((entity) => {
      if (this.world.controlledEntity === entity) {
        const input = entity.getComponent(PlayerInput);
        const health = entity.getComponent(Health);

        switch (button) {
          case MouseButton.LEFT: {
            input.usePrimary = active && health.isAlive;
          }
        }
      }
    });
  }

  public handleKeyboardInput(key: string, active: boolean): void {
    const entities = this.world.getEntities(this.componentTypes);
    if (entities.length === 0) {
      return;
    }

    entities.forEach((entity) => {
      const health = entity.getComponent(Health);

      if (this.world.controlledEntity === entity) {
        const input = entity.getComponent(PlayerInput);
        switch (key) {
          case "ArrowLeft":
            input.left = active && health.isAlive;
            break;

          case "ArrowRight":
            input.right = active && health.isAlive;
            break;

          case "ArrowUp":
            input.up = active && health.isAlive;
            break;

          case "ArrowDown":
            input.down = active && health.isAlive;
            break;
        }
      }
    });
  }

  handleGamepadInput(entity: Entity, controllers: Gamepad[], delta: number): void {
    const input = entity.getComponent(PlayerInput);
    const health = entity.getComponent(Health);

    const controller = controllers[input.gamepadIndex];

    if (controller) {
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

        switch (index) {
          case 0: // A
            input.up = active && health.isAlive;
            break;

          case 1: // B
            break;

          case 2: // X
            input.usePrimary = active && health.isAlive;
            break;

          case 3: // Y
            input.useSecondary = active && health.isAlive;
            break;

          case 4: // LB
            break;

          case 5: // RB
            break;

          case 6: // LT
            input.hold = active && health.isAlive;
            break;

          case 7: // RT
            break;

          case 10: // axis button
            break;

          case 12: // up arrow
            break;

          case 13: // down arrow
            break;

          case 14: // left arrow
            break;

          case 15: // right arrow
            break;

          default:
            if (active && config.DEBUG) {
              console.log(`Unmapped index: ${index}`);
            }
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

    const entities = this.world.getEntities(this.componentTypes);
    if (entities.length === 0) {
      return;
    }

    entities.forEach((entity) => {
      if (this.world.controlledEntity === entity) {
        this.handleGamepadInput(entity, controllers, delta);
      }

      this.enforceWeaponRangeLimit(entity);
    });
  }

  public removedFromWorld(world: World): void {
    super.removedFromWorld(world);
  }
}
