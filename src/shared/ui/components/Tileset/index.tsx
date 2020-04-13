import React from "react";
import cx from "classnames";

import { ITileTypeData } from "@src/shared/models/tilemap.model";

interface ITilesetProps {
  selected: string;
  onSelect: (id: string) => void;
  src: string;
  tileSize: number;
  tileTypes: Record<string, ITileTypeData>;
  scale?: number;
}

const Tileset: React.FunctionComponent<ITilesetProps> = ({ selected, onSelect, src, tileSize, tileTypes }) => {
  const [tiles, setTiles] = React.useState<string[]>([]);

  const groups: string[] = React.useMemo(() => {
    return Object.values(tileTypes)
      .reduce((acc, val) => {
        if (acc.indexOf(val.group) === -1) {
          acc.push(val.group);
        }
        return acc;
      }, [])
      .sort();
  }, [tileTypes]);

  const data = React.useMemo<(ITileTypeData & { id: string })[]>(() => Object.entries(tileTypes).map(([id, temp]) => ({ id, ...temp })), [tileTypes]);

  React.useEffect(() => {
    const temp: string[] = [];

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

      data.map(({ col, row }, i) => {
        const imagedata = ctx.getImageData(col * tileSize, row * tileSize, tileSize, tileSize);
        subCtx.putImageData(imagedata, 0, 0);

        temp[i] = $subCanvas.toDataURL();
      });

      setTiles(temp);
    };

    file.src = src;
  }, []);

  return (
    <div className="tileset">
      {groups.map((group) => {
        const list = data.filter((item) => item.group === group);
        return (
          <div key={group} className="tileset-group">
            <h4 className="tileset-group__title">{group}</h4>
            <div className="tileset-group__list">
              {list.map(({ id }) => (
                <img
                  key={id}
                  onClick={() => {
                    onSelect(id);
                  }}
                  className={cx("pixelated", id === selected && "active")}
                  src={tiles[id]}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Tileset;
