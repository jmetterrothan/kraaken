export type IGamepadBindingMetadata = {
  index: number;
};

class GamepadBinding {
  public readonly index: number;

  public constructor({ index }: IGamepadBindingMetadata) {
    this.index = index;
  }

  public match(index: number) {
    return this.index === index;
  }

  public toString() {
    return this.index;
  }
}

export default GamepadBinding;
