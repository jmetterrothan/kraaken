import { vec2 } from "gl-matrix";

import State from "@src/states/State";

class StateManager {
  private states: Map<number, State>;
  private currentIndex: number;

  constructor() {
    this.states = new Map<number, State>();
    this.currentIndex = -1;
  }

  public add(index: number, state: State) {
    if (this.states.has(index)) {
      throw new Error(
        `State manager has already a State defined @ index "${index}"`
      );
    }

    this.states.set(index, state);
  }

  public update(delta: number) {
    if (this.currentState.ready) {
      this.currentState.update(delta);
    }
  }

  public render(alpha: number) {
    if (this.currentState.ready) {
      this.currentState.render(alpha);
    }
  }

  public handleKeyboardInput(key: string, active: boolean) {
    if (this.currentState.ready) {
      this.currentState.handleKeyboardInput(key, active);
    }
  }

  public handleMousePressed(button: number, active: boolean, position: vec2) {
    if (this.currentState.ready) {
      if (button === 0) {
        this.currentState.handleMouseLeftBtnPressed(active, position);
      } else if (button === 1) {
        this.currentState.handleMouseMiddleBtnPressed(active, position);
      } else if (button === 2) {
        this.currentState.handleMouseRightBtnPressed(active, position);
      }
    }
  }

  public handleMouseMove(position: vec2) {
    if (this.currentState.ready) {
      this.currentState.handleMouseMove(position);
    }
  }

  public handleFullscreenChange(b: boolean) {
    if (this.currentState.ready) {
      this.currentState.handleFullscreenChange(b);
    }
  }

  public handleResize() {
    if (this.currentState.ready) {
      this.currentState.handleResize();
    }
  }

  public async switch(index: number) {
    if (!this.states.has(index)) {
      throw new Error(`Invalid state index provided "${index}"`);
    }

    if (this.currentIndex === index) {
      return;
    }

    if (this.states.has(this.currentIndex)) {
      this.currentState.unmounted();
    }

    this.currentIndex = index;
    this.currentState.mounted();
  }

  public getState (index: number): State {
    return this.states.get(index);
  }

  get currentState(): State {
    return this.getState(this.currentIndex);
  }
}

export default StateManager;
