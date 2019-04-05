import State from '@src/states/State';

interface IStateWrapper {
  state: State;
  initialized: boolean;
};

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

  update() {
    this.currentState.state.update();
  }

  render(delta: number) {
    this.currentState.state.render(delta);
  }

  handleKeyboardInput(key: string, active: boolean) {
    this.currentState.state.handleKeyboardInput(key, active);
  }

  handleMousePressed(button: number, active: boolean, x: number, y: number) {
    this.currentState.state.handleMousePressed(button, active, x, y);
  }

  handleMouseMove(x: number, y: number) {
    this.currentState.state.handleMouseMove(x, y);
  }

  handleFullscreenChange(b: boolean) {
    this.currentState.state.handleFullscreenChange(b);
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