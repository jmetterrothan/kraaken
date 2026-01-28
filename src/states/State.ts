import { vec2 } from "gl-matrix";

import { registerEvent } from "@src/shared/utility/Utility";
import { createRoot, Root } from "react-dom/client";

abstract class State<O = any> {
  public ready = false;

  protected root: Root;

  private eventCallbackStack: Array<() => void> = [];

  constructor() {
    const $kraaken = document.querySelector(".kraaken");

    if (!$kraaken) {
      throw new Error("Could not find game instance root node");
    }

    const $ui = document.createElement("div");
    $ui.classList.add("kraaken-ui");
    $kraaken.appendChild($ui);

    this.root = createRoot($ui);
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
  public registerEvent(type: keyof WindowEventMap, listener: any): void {
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
