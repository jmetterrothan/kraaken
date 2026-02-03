import MouseButton from "./enums/MouseButton";
import MouseBinding from "./shared/utility/MouseBinding";

const mouseBindings = {
  level: {
    fire: [new MouseBinding({ button: MouseButton.LEFT })],
  },
  editor: {
    undo: [new MouseBinding({ button: MouseButton.BROWSER_BACK })],
    redo: [new MouseBinding({ button: MouseButton.BROWSER_FORWARD })],
    terrainMode: {
      place: [new MouseBinding({ button: MouseButton.LEFT })],
      pick: [new MouseBinding({ button: MouseButton.MIDDLE })],
      erase: [new MouseBinding({ button: MouseButton.RIGHT })],
    },
    collisionMode: {
      place: [new MouseBinding({ button: MouseButton.LEFT })],
      erase: [new MouseBinding({ button: MouseButton.RIGHT })],
    },
    entityMode: {
      spawn: [new MouseBinding({ button: MouseButton.LEFT })],
      test: [new MouseBinding({ button: MouseButton.MIDDLE })],
      despawn: [new MouseBinding({ button: MouseButton.RIGHT })],
    },
  },
};

export const matchMouseBinding = (mouseBindings: MouseBinding[], e: MouseEvent) => {
  return mouseBindings.some((mouseBinding) => mouseBinding.match(e));
};

export default mouseBindings;
