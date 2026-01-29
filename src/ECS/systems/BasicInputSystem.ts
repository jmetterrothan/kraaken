import config from "@src/config";
import { System, Entity } from "@src/ECS";

import { BasicInput, Position } from "@src/ECS/components";

import { buttonPressed } from "@src/shared/utility/Utility";

export class BasicInputSystem extends System {
  public constructor() {
    super([Position.COMPONENT_TYPE, BasicInput.COMPONENT_TYPE]);
  }

  public handleKeyboardInput(key: string, active: boolean): void {
    const entities = this.world.getEntities(this.componentTypes);
    if (entities.length === 0) {
      return;
    }

    entities.forEach((entity) => {
      if (this.world.controlledEntity === entity) {
        const input = entity.getComponent(BasicInput);

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

  handleGamepadInput(entity: Entity, controllers: Gamepad[]): void {
    const input = entity.getComponent(BasicInput);

    const controller = controllers[input.gamepadIndex];

    if (controller) {
      const x = controller.axes[0];
      const y = controller.axes[1];

      const deadzone = 0.5;

      input.right = x >= deadzone;
      input.left = x <= -deadzone;
      input.down = y >= deadzone;
      input.up = y <= -deadzone;

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
            input.up = input.up || active;
            break;

          case 13: // down arrow
            input.down = input.down || active;
            break;

          case 14: // left arrow
            input.left = input.left || active;
            break;

          case 15: // right arrow
            input.right = input.right || active;
            break;

          default:
            if (active && config.DEBUG) {
              console.log(`Unmapped index: ${index}`);
            }
        }
      });
    }
  }

  execute(_delta: number): void {
    const controllers = ("getGamepads" in navigator ? navigator.getGamepads() : []).filter((gamepad) => gamepad !== null);

    if (this.world.controlledEntity) {
      this.handleGamepadInput(this.world.controlledEntity, controllers);
    }
  }
}
