export enum EditorTerrainMode {
  ERASE = 0,
  PLACE = 1,
  FILL = 2,
  PICK = 3,
}

export enum EditorMode {
  TERRAIN = 0,
  ENTITY = 1,
  COLLISION = 2,
  ZONE = 3,
}

export const isEditorMode = (value: unknown): value is EditorMode => typeof value === "number" && Object.values(EditorMode).includes(value);
