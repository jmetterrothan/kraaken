import { vec2 } from "gl-matrix";

import { registerEvent } from "@src/shared/utility/Utility";
import { createRoot, Root } from "react-dom/client";
import MouseButton from "@src/enums/MouseButton";

abstract class State<O = any> {
  public ready = false;

  protected root: Root;

  private controller: AbortController;

  constructor() {
    const $kraaken = document.querySelector(".kraaken");

    if (!$kraaken) {
      throw new Error("Could not find game instance root node");
    }

    const $ui = document.createElement("div");
    $ui.classList.add("kraaken-ui");
    $kraaken.appendChild($ui);

    this.controller = new AbortController();

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

  public abstract handleMouseInput(button: MouseButton, active: boolean, position: vec2): void;

  public abstract handleMouseMove(position: vec2): void;

  public abstract handleFullscreenChange(b: boolean): void;

  public abstract handleResize(): void;

  /**
   * Register an event listener to the state that can be later flushed
   */
  public registerEvent(type: keyof WindowEventMap, listener: any): void {
    registerEvent(type, listener, { signal: this.controller.signal });
  }

  /**
   * Remove all event listeners registered in the state
   */
  public flushEvents(): void {
    this.controller.abort();
  }
}

export default State;
