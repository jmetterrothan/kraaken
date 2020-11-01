import React from "react";

import { ITileTypeData } from "@src/shared/models/tilemap.model";

interface IToolbarTilesetItem {
  key?: string;
  index: number;
  row: number;
  col: number;
  group?: string;
  subImage: string;
}

const useTileset = (src: string, tileSize: number, tileTypes: ITileTypeData[]): IToolbarTilesetItem[] => {
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

      const nbCols = (file.width / tileSize) | 0;

      $subCanvas.width = tileSize;
      $subCanvas.height = tileSize;

      tileTypes.map(({ key, col, row, group }) => {
        const imagedata = ctx.getImageData(col * tileSize, row * tileSize, tileSize, tileSize);
        subCtx.putImageData(imagedata, 0, 0);

        temp.push({ key, index: row * nbCols + col, col, row, group, subImage: $subCanvas.toDataURL() });
      });

      setTiles(temp);
    };
    alert("oc");

    file.crossOrigin = "anonymous";
    file.src = src;
  }, [src, tileSize, tileTypes]);

  return tiles;
};

export default useTileset;
