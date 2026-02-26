import GamepadBinding from "./shared/bindings/GamepadBinding";

const gamepadBindings = {
  editor: {
    left: [new GamepadBinding({ index: 14 })],
    right: [new GamepadBinding({ index: 15 })],
    up: [new GamepadBinding({ index: 12 })],
    down: [new GamepadBinding({ index: 13 })],
  },
  level: {
    attack: [new GamepadBinding({ index: 2 })],
    jump: [new GamepadBinding({ index: 0 })],
    grab: [new GamepadBinding({ index: 6 })],
    dash: [new GamepadBinding({ index: 1 })],
    left: [],
    right: [],
    up: [],
    down: [],
  },
};

export const matchGamepadBinding = (gamepadBindings: GamepadBinding[], index: number): boolean => {
  const match = gamepadBindings.some((gamepadBinding) => gamepadBinding.match(index));
  return match;
};

export default gamepadBindings;
