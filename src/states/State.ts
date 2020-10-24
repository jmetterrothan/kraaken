import { vec2 } from "gl-matrix";

const registerEvent = (type: string, listener: EventListenerOrEventListenerObject): () => void => {
  window.addEventListener(type, listener);

  return () => {
    window.removeEventListener(type, listener);
  };
}

abstract class State<O = any> {
  public ready: boolean = false;

  protected $ui: HTMLElement;

  private eventCallbackStack = [];

  constructor() {
    this.$ui = document.createElement("div");
    this.$ui.classList.add("kraken-ui");

    document.getElementById("game").querySelector(".kraken").appendChild(this.$ui);
  }

  public abstract init(options: O): Promise<void>;

  /**
   * Perform actions each time the state is mounted
   */
  public abstract mounted();

  /**
   * Perform actions each time the state is unmounted
   */
  public abstract unmounted();

  public abstract update(delta: number);

  public abstract render(alpha: number);

  public abstract handleKeyboardInput(key: string, active: boolean);

  public abstract handleMouseLeftBtnPressed(active: boolean, position: vec2);

  public abstract handleMouseMiddleBtnPressed(active: boolean, position: vec2);

  public abstract handleMouseRightBtnPressed(active: boolean, position: vec2);

  public abstract handleMouseMove(position: vec2);

  public abstract handleFullscreenChange(b: boolean);

  public abstract handleResize();

  /**
   * Register an event listener to the state that can be later flushed
   */
  public registerEvent(type: string, listener: EventListenerOrEventListenerObject) {
    this.eventCallbackStack.push(registerEvent(type, listener));
  }

  /**
   * Remove all event listeners registered in the state
   */
  public flushEvents() {
    this.eventCallbackStack.forEach((callback) => {
      callback();
    });
  }
}

export default State;
