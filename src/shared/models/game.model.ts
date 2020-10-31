export interface IDimension {
  w: number;
  h: number;
}

export interface IGameOptions {
  width: 'auto' | number;
  height: 'auto' | number;
  maxWidth?: number;
  minWidth?: number;
  maxHeight?: number;
  minHeight?: number;
  allowFullscreen: boolean;
  root: HTMLElement;
  levelId: string;
}

export enum GameStates {
  MENU,
  LEVEL,
  EDITOR,
}
