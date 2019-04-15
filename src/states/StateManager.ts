import { vec2 } from 'gl-matrix';

import State from '@src/states/State';

import { IStateWrapper } from '@shared/models/state.model';

class StateManager {
  private states: Map<number, IStateWrapper>;
  private currentIndex: number;
  private loading: boolean;

  constructor() {
    this.states = new Map<number, IStateWrapper>();
    this.currentIndex = -1;
    this.loading = false;
  }

  public add(index: number, state: State) {
    if (this.states.has(index)) {
      throw new Error(`State manager has already a State defined @ index "${index}"`);
    }

    this.states.set(index, { initialized: false, state });
  }

  public update(delta: number) {
    if (this.currentState.initialized) {
      this.currentState.state.update(delta);
    }
  }

  public render(alpha: number) {
    if (this.currentState.initialized) {
      this.currentState.state.render(alpha);
    }
  }

  public handleKeyboardInput(key: string, active: boolean) {
    if (this.currentState.initialized) {
      this.currentState.state.handleKeyboardInput(key, active);
    }
  }

  public handleMousePressed(button: number, active: boolean, position: vec2) {
    if (this.currentState.initialized) {
      this.currentState.state.handleMousePressed(button, active, position);
    }
  }

  public handleMouseMove(position: vec2) {
    if (this.currentState.initialized) {
      this.currentState.state.handleMouseMove(position);
    }
  }

  public handleFullscreenChange(b: boolean) {
    if (this.currentState.initialized) {
      this.currentState.state.handleFullscreenChange(b);
    }
  }

  public handleResize() {
    if (this.currentState.initialized) {
      this.currentState.state.handleResize();
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

  public setLoading(b: boolean) {
    // TODO: show loading UI
    this.loading = b;
  }

  public getLoading(): boolean {
    return this.loading;
  }

  get currentState(): IStateWrapper {
    return this.states.get(this.currentIndex);
  }
}

export default StateManager;
