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
    const match = e.button === this.button;
    if (match) {
      e.preventDefault();
      e.stopPropagation();
    }
    return this.match;
  }

  public toString() {
    return this.button;
  }
}

export default MouseBinding;
