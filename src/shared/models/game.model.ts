export interface IDimension {
  w: number;
  h: number;
}

export interface IGameOptions {
  width: "auto" | number;
  height: "auto" | number;
  maxWidth?: number;
  minWidth?: number;
  maxHeight?: number;
  minHeight?: number;
  allowFullscreen: boolean;
  appendTo: HTMLElement | null;
}

export enum GameState {
  MENU = 0,
  LEVEL = 1,
  EDITOR = 2,
}

export const isGameState = (value: unknown): value is GameState => {
  return typeof value === "number" && Object.values(GameState).includes(value);
};
