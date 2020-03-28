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
