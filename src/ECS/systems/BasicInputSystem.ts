import { System, Entity } from "@src/ECS";

import { BasicInput, Position } from "@src/ECS/components";
import gamepadBindings, { matchGamepadBinding } from "@src/gamepadBindings";
import keyBindings, { matchKeyBinding } from "@src/keyBindings";

import { buttonPressed } from "@src/shared/utility/Utility";

export class BasicInputSystem extends System {
  public constructor() {
    super([Position.COMPONENT_TYPE, BasicInput.COMPONENT_TYPE]);
  }

  public handleKeyboardInput(e: KeyboardEvent, active: boolean): void {
    const entities = this.world.getEntities(this.componentTypes);
    if (entities.length === 0) {
      return;
    }

    entities.forEach((entity) => {
      if (this.world.controlledEntity === entity) {
        const input = entity.getComponent(BasicInput);

        if (matchKeyBinding(keyBindings.editor.left, e)) {
          input.left = active;
        } else if (matchKeyBinding(keyBindings.editor.right, e)) {
          input.right = active;
        } else if (matchKeyBinding(keyBindings.editor.up, e)) {
          input.up = active;
        } else if (matchKeyBinding(keyBindings.editor.down, e)) {
          input.down = active;
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

        if (matchGamepadBinding(gamepadBindings.editor.up, index)) {
          input.up = input.up || active;
        } else if (matchGamepadBinding(gamepadBindings.editor.down, index)) {
          input.down = input.down || active;
        } else if (matchGamepadBinding(gamepadBindings.editor.left, index)) {
          input.left = input.left || active;
        } else if (matchGamepadBinding(gamepadBindings.editor.right, index)) {
          input.right = input.right || active;
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
