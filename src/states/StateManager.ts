import { vec2 } from 'gl-matrix';

import State from '@src/states/State';

import { IStateWrapper } from './../shared/models/state.model';

class StateManager {
  private states: Map<number, IStateWrapper>;
  private currentIndex: number;
  private _loading: boolean;

  constructor() {
    this.states = new Map<number, IStateWrapper>();
    this.currentIndex = -1;
    this.loading = false;
  }

  add(index: number, state: State) {
    if (this.states.has(index)) {
      throw new Error(`State manager has already a State defined @ index "${index}"`);
    }

    this.states.set(index, { initialized: false, state });
  }

  update(delta: number) {
    if (this.currentState.initialized) {
      this.currentState.state.update(delta);
    }
  }

  render(alpha: number) {
    if (this.currentState.initialized) {
      this.currentState.state.render(alpha);
    }
  }

  handleKeyboardInput(key: string, active: boolean) {
    if (this.currentState.initialized) {
      this.currentState.state.handleKeyboardInput(key, active);
    }
  }

  handleMousePressed(button: number, active: boolean, position: vec2) {
    if (this.currentState.initialized) {
      this.currentState.state.handleMousePressed(button, active, position);
    }
  }

  handleMouseMove(position: vec2) {
    if (this.currentState.initialized) {
      this.currentState.state.handleMouseMove(position);
    }
  }

  handleFullscreenChange(b: boolean) {
    if (this.currentState.initialized) {
      this.currentState.state.handleFullscreenChange(b);
    }
  }

  async switch(index: number) {
    if (!this.states.has(index)) {
      throw new Error(`Invalid state index provided "${index}"`);
    }

    if (this.currentIndex === index) {
      return;
    }

    if (this.states.has(this.currentIndex)) {
      this.currentState.state.dismounted();
    }

    this.currentIndex = index;

    if (!this.currentState.initialized) {
      this.loading = true;
      
      await this.currentState.state.init();
      this.currentState.initialized = true;
      this.loading = false;
    }

    this.currentState.state.mounted();
  }

  set loading(b: boolean) {
    // TODO: show loading UI
    this._loading = b;
  }

  get loading(): boolean {
    return this._loading;
  }

  get currentState(): IStateWrapper {
    return this.states.get(this.currentIndex);
  }
}

export default StateManager;