import { v4 as uuidv4 } from 'uuid';

interface IAtlasTexture {
  key?: string;
  row: number;
  col: number;
  index: number;
  group: string;
  subImage: string;
  averageColor: { r: number; g: number; b: number; a: number }
  emptinessRatio: number;
}

const floodFill = (nbRows: number, nbCols: number, predicate: (index: number) => boolean) => (originRow: number, originCol: number): Set<number> => {
  const stack = new Set<number>();

  const fn = (row: number, col: number) => {
    const index = row * nbCols + col;

    if (col < 0 || row < 0 || col >= nbCols || row >= nbRows) {
      return;
    }
    if (stack.has(index)) {
      return;
    }

    if (!predicate(index)) {
      return;
    }

    stack.add(index);

    fn(row - 1, col);
    fn(row, col - 1);
    fn(row + 1, col);
    fn(row, col + 1);
  };

  fn(originRow, originCol);

  return stack;
}

export const catalog = (src: string, tileSize: number): Promise<{ tiles: IAtlasTexture[]; }> => {
  return new Promise((resolve, reject) => {
    const tiles = new Map<number, IAtlasTexture>();

    const file = new Image();
  
    const $canvas = document.createElement("canvas");
    const ctx = $canvas.getContext("2d");
  
    $canvas.classList.add("pixelated");
  
    file.onload = () => {
      const nbRows = Math.trunc(file.height / tileSize);
      const nbCols = Math.trunc(file.width / tileSize);
  
      $canvas.width = file.width;
      $canvas.height = file.height;
  
      ctx.drawImage(file, 0, 0);
  
      const $subCanvas = document.createElement("canvas");
      const subCtx = $subCanvas.getContext("2d");
  
      $subCanvas.width = tileSize;
      $subCanvas.height = tileSize;
  
      const atlas = new Array(nbRows * nbCols);

      for (let row = 0; row < nbRows; row++) {
        for (let col = 0; col < nbCols; col++) {
          const index = row * nbCols + col;
          const image = ctx.getImageData(col * tileSize, row * tileSize, tileSize, tileSize);

          atlas[index] = image.data;

          if (image.data.find(value => value !== 0)) { 
            subCtx.putImageData(image, 0, 0);

            const pixelNb = image.width * image.height;
            const nbUintValuesInChannel = pixelNb / 4;
            
            let r = 0, g = 0, b = 0;
            let transparentPixelCount = 0;
            
            for (let i = 0; i < pixelNb * 4; i += 4) {
              r += image.data[i];
              g += image.data[i + 1];
              b += image.data[i + 2];

              if (image.data[i + 3] === 0) {
                transparentPixelCount += 1;
              }
            }

            r /= nbUintValuesInChannel;
            g /= nbUintValuesInChannel;
            b /= nbUintValuesInChannel;
            
            tiles.set(index, {
              row,
              col,
              index,
              group: "default",
              subImage: $subCanvas.toDataURL(),
              averageColor: { r, g, b, a: 255 },
              emptinessRatio:  transparentPixelCount / pixelNb
            });
          }
        }
      }

      const history = new Set<number>();
      const groups = [];

      const customFloodFillFn = floodFill(nbRows, nbCols, (index) => {
        return atlas[index].find(value => value !== 0);
      });

      for (let row = 0; row < nbRows; row++) {
        for (let col = 0; col < nbCols; col++) {
          const index = row * nbCols + col;

          if (history.has(index)) {
            continue;
          }

          if (!tiles.has(index)) {
            continue;
          }

          history.add(index);
          
          const groupId: string = uuidv4();
          const tileSubset = customFloodFillFn(row, col);
          
          tileSubset.forEach((subIndex) => {
            const tile = tiles.get(subIndex);
            tile.group = groupId;

            if (!history.has(subIndex)) {
              history.add(subIndex);
            }
          });

          const coords = Array.from(tileSubset).map(subIndex => ({
            x: (subIndex / nbCols) | 0,
            y: (subIndex % nbCols) | 0,
          }));

          let minX;
          let maxX;
          let minY;
          let maxY;

          coords.forEach(({ x, y }) => {
            if (!minX || x < minX) {
              minX = x;
            }
            if (!maxX || x > minX) {
              maxX = x;
            }
            if (!minY || y < minY) {
              minY = y;
            }
            if (!maxY || y > minY) {
              maxY = y;
            }
          });
          
          let display;

          if (!Number.isNaN(minX) && !Number.isNaN(maxX) && !Number.isNaN(minY) && !Number.isNaN(maxY)) {
            const colAmount = 1 + maxX - minX;
            const rowAmount = 1 + maxY - minY;

            display = `${colAmount}x${rowAmount}`;
          }

          groups.push({ id: groupId, display });
        }
      }

      resolve({ tiles: Array.from(tiles.values()) });
    };

    file.onerror = () => {
      reject();
    }
  
    file.crossOrigin = "anonymous";
    file.src = src;
  });
}
