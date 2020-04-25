export interface IDimension {
  w: number;
  h: number;
}

export interface IGameOptions {
  width?: number;
  height?: number;
  allowFullscreen?: boolean;
  root?: HTMLElement;
  debug?: boolean;
}

export enum GameStates {
  MENU,
  LEVEL,
  EDITOR,
}
