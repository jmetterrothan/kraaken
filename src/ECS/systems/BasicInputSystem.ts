import System from "@src/ECS/System";
import Entity from "@src/ECS/Entity";

import { BasicInput } from "@src/ECS/components";
import { POSITION_COMPONENT, BASIC_INPUT_COMPONENT } from "@src/ECS/types";

import { wrapper } from "@src/Game";

import { buttonPressed } from "@shared/utility/Utility";

const gamepads = {};

// TODO: refactor code to make it easier to build alternative controls
export class BasicInputSystem extends System {
  public constructor() {
    super([POSITION_COMPONENT, BASIC_INPUT_COMPONENT]);

    // Keyboard events
    window.addEventListener("keyup", (e: KeyboardEvent) => this.handleKeyboardInput(e.key, false), false);
    window.addEventListener("keydown", (e: KeyboardEvent) => this.handleKeyboardInput(e.key, true), false);
    
    // Gamepad events
    wrapper.addEventListener(
      "gamepadconnected",
      (e: GamepadEvent) => {
        this.handleGamepad(e, true);
      },
      false
    );

    wrapper.addEventListener(
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
      console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.", e.gamepad.index, e.gamepad.id, e.gamepad.buttons.length, e.gamepad.axes.length);

      gamepads[gamepad.index] = gamepad;
    } else {
      delete gamepads[gamepad.index];
    }
  }

  public handleKeyboardInput(key: string, active: boolean): void {
    const entities = this.world.getEntities(this.componentTypes);
    if (entities.length === 0) {
      return;
    }

    entities.forEach((entity) => {
      if (this.world.controlledEntity === entity) {
        const input = entity.getComponent<BasicInput>(BASIC_INPUT_COMPONENT);
        switch (key) {
          case "ArrowLeft":
            input.left = active;
            break;

          case "ArrowRight":
            input.right = active;
            break;

          case "ArrowUp":
            input.up = active;
            break;

          case "ArrowDown":
            input.down = active;
            break;
        }
      }
    });
  }

  handleGamepadInput(entity: Entity, controllers: Gamepad[], delta: number): void {
    const input = entity.getComponent<BasicInput>(BASIC_INPUT_COMPONENT);

    const controller = controllers[input.gamepadIndex];

    if (controller) {
      const x = controller.axes[0];
      const y = controller.axes[1];

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

      if (y >= 0.5) {
        input.up = true;
      } else {
        input.up = false;
      }

      if (y <= -0.5) {
        input.down = true;
      } else {
        input.down = false;
      } 

      // handle buttons
      controller.buttons.forEach((button, index) => {
        const active = buttonPressed(button);

        switch (index) {
          case 0: // A
            break;

          case 1: // B
            break;

          case 2: // X
            break;

          case 3: // Y
            break;

          case 4: // LB
            break;

          case 5: // RB
            break;

          case 6: // LT
            break;

          case 7: // RT
            break;

          case 10: // axis button
            break;

          case 12: // up arrow
            input.up = active;
            break;

          case 13: // down arrow
            input.down = active;
            break;

          case 14: // left arrow
            input.left = active;
            break;

          case 15: // right arrow
            input.right = active;
            break;

          default:
            if (active) {
              console.log(`Unmapped index: ${index}`);
            }
        }
      });
    }
  }

  execute(delta: number): void {
    const controllers = "getGamepads" in navigator ? navigator.getGamepads() : [];

    const entities = this.world.getEntities(this.componentTypes);
    if (entities.length === 0) {
      return;
    }

    entities.forEach((entity) => {
      if (this.world.controlledEntity === entity) {
        this.handleGamepadInput(entity, controllers, delta);
      }
    });
  }
}
