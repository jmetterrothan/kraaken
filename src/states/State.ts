import { vec2 } from "gl-matrix";

abstract class State {
  abstract async init();

  abstract mounted();

  abstract dismounted();

  abstract update(delta: number);

  abstract render(alpha: number);

  abstract handleKeyboardInput(key: string, active: boolean);

  abstract handleMousePressed(button: number, active: boolean, position: vec2);

  abstract handleMouseMove(position: vec2);

  abstract handleFullscreenChange(b: boolean);
}

export default State;