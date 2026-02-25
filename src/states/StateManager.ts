import { vec2 } from "gl-matrix";

import State, { StateOptions } from "@src/states/State";
import { GameState } from "@src/shared/models/game.model";

class StateManager {
  private states: Map<number, State>;
  private currentIndex: number;

  constructor() {
    this.states = new Map<number, State>();
    this.currentIndex = GameState.MENU;
  }

  public add(index: number, state: State): void {
    if (this.states.has(index)) {
      throw new Error(`State manager has already a State defined @ index "${index}"`);
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

  public handleKeyboardInput(e: KeyboardEvent, active: boolean): void {
    if (this.isReady) {
      this.currentState.handleKeyboardInput(e, active);
    }
  }

  public handleMouseInput(e: MouseEvent, active: boolean, position: vec2): void {
    if (this.isReady) {
      this.currentState.handleMouseInput(e, active, position);
    }
  }

  public handleMouseMove(e: MouseEvent, position: vec2): void {
    if (this.isReady) {
      this.currentState.handleMouseMove(e, position);
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

  public async switch<O extends StateOptions = StateOptions>(index: GameState, options: O): Promise<void> {
    if (!this.states.has(index)) {
      throw new Error(`Invalid state index provided "${index}"`);
    }

    if (this.currentIndex === index) {
      return;
    }

    // unmount previous state
    const currentState = this.currentState;
    if (typeof currentState !== "undefined") {
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

  public getState(index: GameState): State {
    return this.states.get(index)!;
  }

  get currentState(): State {
    return this.getState(this.currentIndex);
  }

  get isReady(): boolean {
    return this.currentState && this.currentState.ready;
  }
}

export default StateManager;
