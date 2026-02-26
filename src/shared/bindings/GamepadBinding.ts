export type IGamepadBindingMetadata = {
  index: number;
};

const mapping: Record<number, string> = {
  0: "A",
  1: "B",
  2: "X",
  3: "Y",
  4: "LB",
  5: "RB",
  6: "LT",
  7: "RT",
  12: "↑",
  13: "↓",
  14: "←",
  15: "→",
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
    if (mapping[this.index]) {
      return mapping[this.index];
    }
    return this.index;
  }
}

export default GamepadBinding;
