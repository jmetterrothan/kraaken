import { vec2 } from "gl-matrix";

import { IWorldBlueprint } from '@shared/models/world.model';

export const isPowerOf2 = (value: number): boolean => {
  return (value & (value - 1)) === 0;
};

export const create2DArray = <T>(rows: number, cols: number): T[][] => {
  const a: T[][] = new Array(rows);

  for (let r = 0; r < rows; r++) {
    a[r] = new Array(cols);
  }

  return a;
};

export const getCoord = (canvas: HTMLCanvasElement, x: number, y: number): vec2 => {
  const rect = canvas.getBoundingClientRect();
  return vec2.fromValues((x - rect.left) * window.devicePixelRatio, (y - rect.top) * window.devicePixelRatio);
};

export const getMouseOffsetX = (canvas: HTMLCanvasElement, e: MouseEvent) : number=> {
  return e.clientX - document.body.scrollLeft + canvas.scrollLeft;
};

export const getMouseOffsetY = (canvas: HTMLCanvasElement, e: MouseEvent): number => {
  return e.clientY - document.body.scrollTop + canvas.scrollTop;
};

export const buttonPressed = (b: GamepadButton): boolean => {
  if (typeof b === "object") {
    return b.pressed;
  }
  return b === 1.0;
};

export const registerEvent = (type: string, listener: EventListenerOrEventListenerObject, target: Window = window): () => void => {
  target.addEventListener(type, listener);

  return () => {
    target.removeEventListener(type, listener);
  };
}

export const loadData = async (i: number): Promise<IWorldBlueprint> => {
  const { default: level } = await import(`@src/data/level${i}/level.json`);
  const { default: entities } = await import(`@src/data/level${i}/entities.json`);
  const { default: resources } = await import(`@src/data/level${i}/resources.json`);

  return {
    level,
    entities,
    resources,
  };
};
