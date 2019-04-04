import State from '@src/states/State';

class StateManager {
  private states: Map<number, State>;
  private currentIndex: number;

  constructor() {
    this.states = new Map<number, State>();
    this.currentIndex = -1;
  }

  init() {

  }

  add(index: number, state: State) {
    if (this.states.has(index)) {
      throw new Error(`State manager has already a State defined @ index "${index}"`);
    }
    this.states.set(index, state);
  }

  update() {
    this.states.get(this.currentIndex).update();
  }

  render(delta: number) {
    this.states.get(this.currentIndex).render(delta);
  }

  handleKeyboardInput(key: string, active: boolean) {
    this.states.get(this.currentIndex).handleKeyboardInput(key, active);
  }

  handleMousePressed(button: number, active: boolean, x: number, y: number) {
    this.states.get(this.currentIndex).handleMousePressed(button, active, x, y);
  }

  handleMouseMove(x: number, y: number) {
    this.states.get(this.currentIndex).handleMouseMove(x, y);
  }

  handleFullscreenChange(b: boolean) {
    this.states.get(this.currentIndex).handleFullscreenChange(b);
  }

  set currentState(index: number) {
    if (!this.states.has(index)) {
        throw new Error(`Invalid state index provided "${index}"`);
    }

    if (this.currentIndex === index) {
      return;
    }

    if (this.states.has(this.currentIndex)) {
      this.states.get(this.currentIndex).dismounted();
    }

    this.currentIndex = index;
    this.states.get(this.currentIndex).mounted();
  }

  get currentState(): number {
      return this.currentIndex;
  }
}

export default StateManager;