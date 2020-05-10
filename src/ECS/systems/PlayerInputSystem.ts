import System from "@src/ECS/System";

import { PlayerInput } from "@src/ECS/components";

import { PLAYER_INPUT_COMPONENT } from "@src/ECS/types";

export class PlayerInputSystem extends System {
  public constructor() {
    super([PLAYER_INPUT_COMPONENT]);

    // Keyboard events
    window.addEventListener("keyup", (e) => this.handleKeyboardInput(e.key, false), false);
    window.addEventListener("keydown", (e) => this.handleKeyboardInput(e.key, true), false);
  }

  public handleKeyboardInput(key: string, active: boolean) {
    const entities = this.world.getEntities(this.componentTypes);
    if (entities.length === 0) {
      return;
    }

    entities.forEach((entity) => {
      const input = entity.getComponent<PlayerInput>(PLAYER_INPUT_COMPONENT);

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
    });
  }

  execute(delta: number): void {
    // nothing to execute
  }
}
