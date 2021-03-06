import { vec2 } from "gl-matrix";

import State from "@src/states/State";

class StateManager {
  private states: Map<number, State>;
  private currentIndex: number;

  constructor() {
    this.states = new Map<number, State>();
    this.currentIndex = -1;
  }

  public add(index: number, state: State): void {
    if (this.states.has(index)) {
      throw new Error(
        `State manager has already a State defined @ index "${index}"`
      );
    }

    this.states.set(index, state);
  }

  public update(delta: number): void {
    if (this.isReady) {
      this.currentState.update(delta);
    }
  }

  public render(alpha: number): void {
    if (this.isReady) {
      this.currentState.render(alpha);
    }
  }

  public handleKeyboardInput(key: string, active: boolean): void {
    if (this.isReady) {
      this.currentState.handleKeyboardInput(key, active);
    }
  }

  public handleMousePressed(button: number, active: boolean, position: vec2): void {
    if (this.isReady) {
      if (button === 0) {
        this.currentState.handleMouseLeftBtnPressed(active, position);
      } else if (button === 1) {
        this.currentState.handleMouseMiddleBtnPressed(active, position);
      } else if (button === 2) {
        this.currentState.handleMouseRightBtnPressed(active, position);
      }
    }
  }

  public handleMouseMove(position: vec2): void {
    if (this.isReady) {
      this.currentState.handleMouseMove(position);
    }
  }

  public handleFullscreenChange(b: boolean): void {
    if (this.isReady) {
      this.currentState.handleFullscreenChange(b);
    }
  }

  public handleResize(): void {
    if (this.isReady) {
      this.currentState.handleResize();
    }
  }

  public async switch(index: number, options: any = undefined): Promise<void> {
    if (!this.states.has(index)) {
      throw new Error(`Invalid state index provided "${index}"`);
    }

    if (this.currentIndex === index) {
      return;
    }

    // unmount previous state
    const currentState = this.currentState;
    if (typeof currentState !== 'undefined') {
      currentState.unmounted();
    }

    this.currentIndex = index;

    // mount new state
    const newState = this.getState(index);
    newState.ready = false;
  
    await newState.init(options);
  
    newState.ready = true;
    newState.mounted();
  }

  public getState (index: number): State {
    return this.states.get(index);
  }

  get currentState(): State {
    return this.getState(this.currentIndex);
  }

  get isReady(): boolean {
    return this.currentState && this.currentState.ready;
  }
}

export default StateManager;
