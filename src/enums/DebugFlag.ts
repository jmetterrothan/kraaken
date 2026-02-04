export const enum DebugFlag {
  NONE = 0,
  STATS = 1 << 0,
  CAMERA = 1 << 1,
  GRID = 1 << 2,
  COLLISION = 1 << 3,
  ENTITIES = 1 << 4,
  ALL = 0xffffffff,
}
