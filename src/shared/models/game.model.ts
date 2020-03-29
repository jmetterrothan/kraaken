export interface IDimension {
  w: number;
  h: number;
}

export interface IGameOptions {
  width?: number;
  height?: number;
  allowFullscreen?: boolean;
  root?: HTMLElement;
}

export enum GameStates {
  MENU,
  LEVEL1,
  EDITOR
}
