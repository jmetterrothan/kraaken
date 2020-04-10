import React from "react";
import cx from "classnames";

import { ITileTypeData } from "../models/tilemap.model";

import tilesetSrc from "@src/data/level2/assets/graphics/tileset.png";

import "./LevelStateUi.scss";

const tileTypeChange = (id: string) => {
  return new CustomEvent("change_tiletype", {
    detail: {
      id,
    },
  });
};

const layerChange = (id: number) => {
  return new CustomEvent("change_layer", {
    detail: {
      id,
    },
  });
};

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

      Object.values(tileTypes).map(({ col, row }, i) => {
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
      {Object.entries(tileTypes).map(([id, { col, row, key: name }], i) => (
        <img
          onClick={() => {
            onSelect(id);
          }}
          className={cx("tileset__item", "pixelated", id === selected && "active")}
          key={name}
          src={tiles[i]}
          width={48}
          height={48}
        />
      ))}
    </div>
  );
};

export default ({ level }) => {
  const [layerId, setLayerId] = React.useState<number>(1);
  const [tileTypeId, setTileTypeId] = React.useState<string>("1");

  const tileTypes: Record<string, ITileTypeData> = level.tileMap.tileTypes;

  React.useEffect(() => {
    window.dispatchEvent(tileTypeChange(tileTypeId));
  }, [tileTypeId]);

  React.useEffect(() => {
    window.dispatchEvent(layerChange(layerId));
  }, [layerId]);

  return (
    <div className="ui">
      <Tileset selected={tileTypeId} onSelect={setTileTypeId} src={tilesetSrc} tileSize={16} tileTypes={tileTypes} />
      <div className="tiles">
        <select
          value={layerId}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            setLayerId(parseInt(e.target.value, 10));
          }}
        >
          <option value={1}>layer 1</option>
          <option value={2}>layer 2</option>
        </select>

        <select
          value={tileTypeId}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            setTileTypeId(e.target.value);
          }}
        >
          {Object.entries(tileTypes).map(([id, tileType]) => (
            <option key={id} value={id}>
              {tileType.key}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
