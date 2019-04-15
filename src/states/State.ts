import { vec2 } from 'gl-matrix';

abstract class State {
  public abstract async init();

  public abstract mounted();

  public abstract dismounted();

  public abstract update(delta: number);

  public abstract render(alpha: number);

  public abstract handleKeyboardInput(key: string, active: boolean);

  public abstract handleMousePressed(button: number, active: boolean, position: vec2);

  public abstract handleMouseMove(position: vec2);

  public abstract handleFullscreenChange(b: boolean);

  public abstract handleResize();
}

export default State;
