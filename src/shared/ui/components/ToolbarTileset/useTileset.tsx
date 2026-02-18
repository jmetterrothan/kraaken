import { driver } from "@src/shared/drivers/DriverFactory";
import { ISpriteData } from "@src/shared/models/sprite.model";
import React from "react";
import { useCallback } from "react";

export interface IToolbarTilesetItem {
  width: number;
  height: number;
  index: number;
  row: number;
  col: number;
  group?: string;
  subImage: string;
}

type ProcessedTileset = { tiles: IToolbarTilesetItem[]; cols: number; rows: number };

const CACHE: Map<string, Promise<ProcessedTileset>> = new Map();

const processTileset = async (src: string, tileWidth: number, tileHeight = tileWidth) => {
  if (CACHE.has(src)) {
    console.debug(`Recovered tileset from cache @ "${src}"`);
    return CACHE.get(src)!;
  }

  const promise = new Promise<ProcessedTileset>((resolve, reject) => {
    const tiles: IToolbarTilesetItem[] = [];

    const file = new Image();

    const $canvas = document.createElement("canvas");
    const ctx = $canvas.getContext("2d", { willReadFrequently: true });

    $canvas.classList.add("pixelated");

    file.onload = () => {
      $canvas.width = file.width;
      $canvas.height = file.height;

      if (ctx) {
        ctx.drawImage(file, 0, 0);

        const $subCanvas = document.createElement("canvas");
        const subCtx = $subCanvas.getContext("2d");

        if (subCtx) {
          $subCanvas.width = tileWidth;
          $subCanvas.height = tileHeight;

          const rows = Math.trunc(file.height / tileHeight);
          const cols = Math.trunc(file.width / tileWidth);

          for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
              const index = row * cols + col;

              const imagedata = ctx.getImageData(col * tileWidth, row * tileHeight, tileWidth, tileHeight);

              // filter out empty tiles
              if (imagedata.data.find((value) => value !== 0)) {
                subCtx.putImageData(imagedata, 0, 0);

                tiles[index] = { width: tileWidth, height: tileHeight, index, col, row, group: "default", subImage: $subCanvas.toDataURL() };
              }
            }
          }

          resolve({
            tiles,
            rows,
            cols,
          });
        }
      }
    };

    file.onerror = (e) => {
      console.error(e);
      reject(e);
    };

    file.crossOrigin = "anonymous";
    file.src = driver.getAssetUrl(src);
  });
  console.debug(`Processed tileset @ "${src}"`);

  CACHE.set(src, promise);

  return promise;
};

const useTileset = ({ src, tileWidth, tileHeight = tileWidth }: ISpriteData) => {
  const [tiles, setTiles] = React.useState<IToolbarTilesetItem[]>([]);

  const [nbRows, setNbRows] = React.useState<number>(0);
  const [nbCols, setNbCols] = React.useState<number>(0);

  React.useEffect(() => {
    if (src.length > 0) {
      const fn = async () => {
        const { tiles, rows, cols } = await processTileset(src, tileWidth, tileHeight);

        setNbRows(rows);
        setNbCols(cols);
        setTiles(tiles);
      };

      fn();
    }
  }, [src, tileWidth, tileHeight]);

  const getIndex = useCallback(
    (row: number, col: number) => {
      return row * nbCols + col;
    },
    [nbCols]
  );

  const getTileAt = useCallback(
    (row: number, col: number) => {
      const index = getIndex(row, col);
      return tiles[index];
    },
    [getIndex, tiles]
  );

  return {
    tiles,
    nbRows,
    nbCols,
    width: tileWidth * nbCols,
    height: tileHeight * nbRows,
    getTileAt,
    getIndex,
  } as const;
};

export default useTileset;
