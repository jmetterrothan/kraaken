import { vec2 } from "gl-matrix";

import System from "@src/ECS/System";

import { PlayerInput } from "@src/ECS/components";

import { PLAYER_INPUT_COMPONENT } from "@src/ECS/types";

const getCoord = (c: HTMLCanvasElement, x: number, y: number): vec2 => {
  const rect = c.getBoundingClientRect();
  return vec2.fromValues((x - rect.left) * window.devicePixelRatio, (y - rect.top) * window.devicePixelRatio);
};

export class PlayerInputSystem extends System {
  public constructor() {
    super([PLAYER_INPUT_COMPONENT]);

    // Mouse events
    window.addEventListener("mouseup", (e) => this.handleMouseInput(e.button, false), false);
    window.addEventListener("mousedown", (e) => this.handleMouseInput(e.button, true), false);

    // Keyboard events
    window.addEventListener("keyup", (e) => this.handleKeyboardInput(e.key, false), false);
    window.addEventListener("keydown", (e) => this.handleKeyboardInput(e.key, true), false);
  }

  public handleMouseInput(button: number, active: boolean) {
    const entities = this.world.getEntities(this.componentTypes);
    if (entities.length === 0) {
      return;
    }

    entities.forEach((entity) => {
      const input = entity.getComponent<PlayerInput>(PLAYER_INPUT_COMPONENT);

      if (button === 2) {
        input.use = active;
      }
    });
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

  execute(delta: number): void {}
}
