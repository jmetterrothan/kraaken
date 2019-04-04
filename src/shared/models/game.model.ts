export interface IDimension {
  w: number;
  h: number;
};

export interface IGameOptions {
  width?: number;
  height?: number;
  allowFullscreen?: boolean;
};

export enum GameStates {
  MENU,
  LEVEL,
  EDITOR
};