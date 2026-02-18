import KeyBinding, { IS_MAC_PLATFORM } from "./shared/bindings/KeyBinding";

const keyBindings = {
  level: {
    grab: [new KeyBinding({ code: "KeyC" }), new KeyBinding({ code: "KeyE" })],
    left: [new KeyBinding({ code: "KeyA" })],
    right: [new KeyBinding({ code: "KeyD" })],
    up: [new KeyBinding({ code: "KeyW" })],
    down: [new KeyBinding({ code: "KeyS" })],
    jump: [new KeyBinding({ code: "Space" })],
    dash: [new KeyBinding({ code: "ShiftLeft" })],
    attack: [],
    edit: [new KeyBinding({ code: "KeyE", meta: IS_MAC_PLATFORM, ctrl: !IS_MAC_PLATFORM })],
  },
  editor: {
    save: [new KeyBinding({ code: "KeyS", ctrl: true })],
    play: [new KeyBinding({ code: "KeyP", ctrl: true })],
    undo: [new KeyBinding({ code: "KeyW", meta: IS_MAC_PLATFORM, ctrl: !IS_MAC_PLATFORM })],
    redo: [new KeyBinding({ code: "KeyY", meta: IS_MAC_PLATFORM, ctrl: !IS_MAC_PLATFORM })],
    zoomIn: [new KeyBinding({ code: "NumpadAdd" })],
    zoomOut: [new KeyBinding({ code: "NumpadSubtract" })],
    place: [new KeyBinding({ code: "Digit1" })],
    fill: [new KeyBinding({ code: "Digit2" })],
    erase: [new KeyBinding({ code: "Digit3" })],
    pick: [new KeyBinding({ code: "Digit4" })],
  },
};

export const matchKeyBinding = (keyBindings: KeyBinding[], e: KeyboardEvent): boolean => {
  const match = keyBindings.some((keyBinding) => keyBinding.match(e));

  if (match) {
    e.preventDefault();
    e.stopPropagation();
  }
  return match;
};

export default keyBindings;
