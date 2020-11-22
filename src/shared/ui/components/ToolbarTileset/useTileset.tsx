import React from "react";

export interface IToolbarTilesetItem {
  key?: string;
  index: number;
  row: number;
  col: number;
  group?: string;
  subImage: string;
}

const useTileset = (src: string, tileSize: number): { tiles: IToolbarTilesetItem[]; nbCols: number; nbRows: number } => {
  const [tiles, setTiles] = React.useState<IToolbarTilesetItem[]>([]);

  const [nbRows, setNbRows] = React.useState<number>();
  const [nbCols, setNbCols] = React.useState<number>();

  React.useEffect(() => {
    const temp: IToolbarTilesetItem[] = [];

    const file = new Image();

    const $canvas = document.createElement("canvas");
    const ctx = $canvas.getContext("2d");

    $canvas.classList.add("pixelated");

    file.onload = () => {
      $canvas.width = file.width;
      $canvas.height = file.height;

      ctx.drawImage(file, 0, 0);

      const $subCanvas = document.createElement("canvas");
      const subCtx = $subCanvas.getContext("2d");

      $subCanvas.width = tileSize;
      $subCanvas.height = tileSize;

      const rows = Math.trunc(file.height / tileSize);
      const cols = Math.trunc(file.width / tileSize);

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const imagedata = ctx.getImageData(col * tileSize, row * tileSize, tileSize, tileSize);

          // filter out empty tiles
          if (imagedata.data.find((value) => value !== 0)) {
            subCtx.putImageData(imagedata, 0, 0);

            temp.push({ index: row * cols + col, col, row, group: "default", subImage: $subCanvas.toDataURL() });
          }
        }
      }

      setNbRows(rows);
      setNbCols(cols);
      setTiles(temp);
    };

    file.crossOrigin = "anonymous";
    file.src = src;
  }, [src, tileSize]);

  return { tiles, nbRows, nbCols };
};

export default useTileset;
