import { vec2 } from "gl-matrix";

const registerEvent = (type: string, listener: EventListenerOrEventListenerObject): () => void => {
  window.addEventListener(type, listener);

  return () => {
    window.removeEventListener(type, listener);
  };
}

abstract class State<O = any> {
  public ready = false;

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
  public abstract mounted(): void;

  /**
   * Perform actions each time the state is unmounted
   */
  public abstract unmounted(): void;

  public abstract update(delta: number): void;

  public abstract render(alpha: number): void;

  public abstract handleKeyboardInput(key: string, active: boolean): void;

  public abstract handleMouseLeftBtnPressed(active: boolean, position: vec2): void;

  public abstract handleMouseMiddleBtnPressed(active: boolean, position: vec2): void;

  public abstract handleMouseRightBtnPressed(active: boolean, position: vec2): void;

  public abstract handleMouseMove(position: vec2): void;

  public abstract handleFullscreenChange(b: boolean): void;

  public abstract handleResize(): void;

  /**
   * Register an event listener to the state that can be later flushed
   */
  public registerEvent(type: string, listener: EventListenerOrEventListenerObject): void {
    this.eventCallbackStack.push(registerEvent(type, listener));
  }

  /**
   * Remove all event listeners registered in the state
   */
  public flushEvents(): void {
    this.eventCallbackStack.forEach((callback) => {
      callback();
    });
  }
}

export default State;
