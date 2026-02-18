import GamepadBinding from "./shared/bindings/GamepadBinding";

/*
case 0: // A
  break;

case 1: // B
  break;

case 2: // X
  break;

case 3: // Y
  break;

case 4: // LB
  break;

case 5: // RB
  break;

case 6: // LT
  break;

case 7: // RT
  break;

case 10: // axis button
  break;

case 12: // up arrow 
  break;

case 13: // down arrow 
  break;

case 14: // left arrow 
  break;

case 15: // right arrow 
  break;
*/

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
