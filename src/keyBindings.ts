import KeyBinding from "./shared/bindings/KeyBinding";

const keyBindings = {
  level: {
    left: [new KeyBinding({ code: "ArrowLeft" }), new KeyBinding({ code: "KeyA" })],
    right: [new KeyBinding({ code: "ArrowRight" }), new KeyBinding({ code: "KeyD" })],
    up: [new KeyBinding({ code: "ArrowUp" }), new KeyBinding({ code: "KeyW" })],
    down: [new KeyBinding({ code: "ArrowDown" }), new KeyBinding({ code: "KeyS" })],
    usePrimaryWeapon: [],
    useSecondaryWeapon: [new KeyBinding({ code: "KeyG" })],
    edit: [new KeyBinding({ code: "KeyE", ctrl: true })],
  },
  editor: {
    save: [new KeyBinding({ code: "KeyS", ctrl: true })],
    play: [new KeyBinding({ code: "KeyP", ctrl: true })],
    undo: [new KeyBinding({ code: "KeyU" })],
    redo: [new KeyBinding({ code: "KeyR" })],
    zoomIn: [new KeyBinding({ code: "NumpadAdd" })],
    zoomOut: [new KeyBinding({ code: "NumpadSubtract" })],
    place: [new KeyBinding({ code: "Digit1" })],
    fill: [new KeyBinding({ code: "Digit2" })],
    erase: [new KeyBinding({ code: "Digit3" })],
    pick: [new KeyBinding({ code: "Digit4" })],
  },
};

export const matchKeyBinding = (keyBindings: KeyBinding[], e: KeyboardEvent) => {
  const match = keyBindings.some((keyBinding) => keyBinding.match(e));
  if (match) {
    e.preventDefault();
    e.stopPropagation();
  }
  return match;
};

export default keyBindings;
