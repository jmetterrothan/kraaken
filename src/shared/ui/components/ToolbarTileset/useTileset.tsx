import React from "react";

interface IToolbarTilesetItem {
  key?: string;
  index: number;
  row: number;
  col: number;
  group?: string;
  subImage: string;
}

const useTileset = (src: string, tileSize: number): IToolbarTilesetItem[] => {
  const [tiles, setTiles] = React.useState<IToolbarTilesetItem[]>([]);

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

      const nbRows = Math.trunc(file.height / tileSize);
      const nbCols = Math.trunc(file.width / tileSize);

      $subCanvas.width = tileSize;
      $subCanvas.height = tileSize;

      for (let row = 0; row < nbRows; row++) {
        for (let col = 0; col < nbCols; col++) {
          const imagedata = ctx.getImageData(col * tileSize, row * tileSize, tileSize, tileSize);

          // filter out empty tiles
          if (imagedata.data.find((value) => value !== 0)) {
            subCtx.putImageData(imagedata, 0, 0);

            temp.push({ index: row * nbCols + col, col, row, group: "default", subImage: $subCanvas.toDataURL() });
          }
        }
      }

      setTiles(temp);
    };

    file.crossOrigin = "anonymous";
    file.src = src;
  }, [src, tileSize]);

  return tiles;
};

export default useTileset;
