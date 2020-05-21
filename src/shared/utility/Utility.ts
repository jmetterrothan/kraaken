import { vec2 } from "gl-matrix";

export const uuid = (): string => {
  // @ts-ignore
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) => (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16));
};

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

export const getMouseOffsetX = (canvas: HTMLCanvasElement, e: MouseEvent) => {
  return e.clientX - document.body.scrollLeft + canvas.scrollLeft;
};

export const getMouseOffsetY = (canvas: HTMLCanvasElement, e: MouseEvent) => {
  return e.clientY - document.body.scrollTop + canvas.scrollTop;
};

export const buttonPressed = (b: GamepadButton) => {
  if (typeof b === "object") {
    return b.pressed;
  }
  return b === 1.0;
};
