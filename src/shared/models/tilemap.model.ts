export interface ITileMapData {
  rows: number;
  cols: number;
  tileSize: number;
  tileTypes: {
    [key: string]: ITileTypeData;
  };
  tiles: number[];
}

export interface ITileTypeData {
  solid: boolean;
  row: number;
  col: number;
}
