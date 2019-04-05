abstract class State {
  constructor() {

  }

  abstract async init();

  abstract mounted();

  abstract dismounted();

  abstract update(delta: number);

  abstract render(alpha: number);

  abstract handleKeyboardInput(key: string, active: boolean);

  abstract handleMousePressed(button: number, active: boolean, x: number, y: number);

  abstract handleMouseMove(x: number, y: number);

  abstract handleFullscreenChange(b: boolean);
}

export default State;