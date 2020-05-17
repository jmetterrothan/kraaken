import Vector2 from "@shared/math/Vector2";

// the maximum is exclusive and the minimum is inclusive
export const getRandomInt = (a: number, b: number): number => {
  const min = Math.ceil(a);
  const max = Math.floor(b);

  return Math.floor(Math.random() * (max - min)) + min;
};

// the maximum is inclusive and the minimum is inclusive
export const getRandomIntInclusive = (a: number, b: number): number => {
  const min = Math.ceil(a);
  const max = Math.floor(b);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const getRandomFloat = (a: number, b: number): number => {
  return Math.random() * (b - a) + a;
};

export const radToDeg = (r: number): number => {
  return (r * 180) / Math.PI;
};

export const degToRad = (d: number): number => {
  return (d * Math.PI) / 180;
};

export const clamp = (val: number, min: number, max: number): number => {
  return Math.min(Math.max(min, val), max);
};

export const lerp = (a: number, b: number, t: number): number => {
  return (1 - t) * a + t * b;
};

export const lerp2 = (a: number, b: number, t: number): number => {
  return a + t * (b - a);
};

// return the point of intersection between two segments or undefined, see https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection
export const linesIntersection = (x1, y1, x2, y2, x3, y3, x4, y4): Vector2 | undefined => {
  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));

  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return new Vector2(x3 + u * (x4 - x3), y3 + u * (y4 - y3));
  }

  return;
};

export const linesIntersectionWithVector2 = (a1: Vector2, b1: Vector2, a2: Vector2, b2: Vector2): Vector2 | undefined => {
  return linesIntersection(a1.x, a1.y, b1.x, b1.y, a2.x, a2.y, b2.x, b2.y);
};

export const pointCircleIntersection = (center: Vector2, r: number, point: Vector2): boolean => {
  return (point.x - center.x) * (point.x - center.x) + (point.y - center.y) * (point.y - center.y) <= r * r;
};
