import { vec2 } from "gl-matrix";

import { registerEvent } from "@src/shared/utility/Utility";
import { createRoot, Root } from "react-dom/client";

abstract class State<O = any> {
  public ready = false;

  protected root: Root;

  private controller: AbortController;

  constructor() {
    this.controller = new AbortController();
  }

  public abstract init(options: O): Promise<void>;

  /**
   * Perform actions each time the state is mounted
   */
  public mounted(): void {
    this.controller = new AbortController();
  }

  /**
   * Perform actions each time the state is unmounted
   */
  public abstract unmounted(): void;

  public abstract update(delta: number): void;

  public abstract render(alpha: number): void;

  public abstract handleKeyboardInput(e: KeyboardEvent, active: boolean): void;

  public abstract handleMouseInput(e: MouseEvent, active: boolean, position: vec2): void;

  public abstract handleMouseMove(e: MouseEvent, position: vec2): void;

  public abstract handleFullscreenChange(b: boolean): void;

  public abstract handleResize(): void;

  /**
   * Register an event listener to the state that can be later flushed
   */
  public registerEvent(type: keyof WindowEventMap, listener: any) {
    console.debug(`Registered event ${type}`);
    return registerEvent(type, listener, { signal: this.controller.signal });
  }

  /**
   * Remove all event listeners registered in the state
   */
  public flushEvents(): void {
    console.debug(`Flushed events`);
    this.controller.abort();
  }

  protected createRoot(): Root {
    const $kraaken = document.querySelector(".kraaken");

    if (!$kraaken) {
      throw new Error("Could not find game instance root node");
    }

    const $ui = document.createElement("div");
    $ui.classList.add("kraaken-ui");
    $kraaken.appendChild($ui);

    this.root = createRoot($ui);
    return this.root;
  }
}

export default State;
