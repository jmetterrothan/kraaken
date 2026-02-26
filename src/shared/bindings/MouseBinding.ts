import MouseButton from "@src/enums/MouseButton";

export type IMouseBindingMetadata = {
  button: MouseButton;
};

const mapping: Record<number, string> = {
  [MouseButton.LEFT]: "Left button",
  [MouseButton.RIGHT]: "Right button",
  [MouseButton.MIDDLE]: "Middle button",
  [MouseButton.BROWSER_BACK]: "Browser back button",
  [MouseButton.BROWSER_FORWARD]: "Browser forward button",
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
    if (mapping[this.button]) {
      return mapping[this.button];
    }
    return this.button;
  }
}

export default MouseBinding;
