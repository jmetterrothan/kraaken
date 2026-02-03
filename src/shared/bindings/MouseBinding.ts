import MouseButton from "@src/enums/MouseButton";

export type IMouseBindingMetadata = {
  button: MouseButton;
};

class MouseBinding {
  public readonly button: MouseButton;

  public constructor({ button }: IMouseBindingMetadata) {
    this.button = button;
  }

  public match(e: MouseEvent) {
    const matching = e.button === this.button;
    if (matching) {
      e.preventDefault();
      e.stopPropagation();
    }
    return matching;
  }

  public toString() {
    return this.button;
  }
}

export default MouseBinding;
