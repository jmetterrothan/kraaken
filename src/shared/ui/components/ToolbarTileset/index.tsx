import React from "react";
import cx from "classnames";

import { ITileTypeData, ITileTypes, ITileGroups, ITileTypeGroup } from "@src/shared/models/tilemap.model";

import ToolbarButton from "../ToolbarButton";

import "./ToolbarTileset.scss";

interface IToolbarTilesetProps {
  selected: string;
  onSelect: (id: string) => void;
  src: string;
  tileSize: number;
  tileTypes: ITileTypes;
  tileGroups: ITileGroups;
  scale?: number;
}

const ToolbarTileset: React.FunctionComponent<IToolbarTilesetProps> = ({ selected, onSelect, src, tileSize, tileTypes, tileGroups }) => {
  const [tiles, setTiles] = React.useState<string[]>([]);

  const ref = React.useRef<HTMLDivElement>(null);

  const [open, setOpen] = React.useState(false);

  React.useLayoutEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", fn);

    return () => {
      window.removeEventListener("mousedown", fn);
    };
  }, [ref]);

  const handleBtnClick = () => {
    setOpen(!open);
  };

  const groups: ITileTypeGroup[] = React.useMemo(() => {
    return Object.values(tileTypes)
      .reduce((acc, val) => {
        if (acc.findIndex((item) => item.id === val.group) === -1) {
          const tileGroup = tileGroups[val.group] || {};
          acc.push({ id: val.group, ...tileGroup });
        }
        return acc;
      }, [])
      .sort((a, b) => {
        if (a.name < b.name) {
          return -1;
        }
        if (b.name < a.name) {
          return 1;
        }
        return 0;
      });
  }, [tileTypes, tileGroups]);

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
    <div ref={ref} className={cx("toolbar-tileset", open && "open")}>
      <ToolbarButton icon="alien-monster" active={false} name="Select Texture" showCaret={true} onClick={handleBtnClick} />

      <div className="toolbar-tileset__inner">
        {groups.map((group) => {
          const list = data.filter((item) => item.group === group.id);
          return (
            <div key={group.id} className="toolbar-tileset-group">
              <h4 className="toolbar-tileset-group__title">{group.name || `[${group.id}]`}</h4>
              <ul className={cx("toolbar-tileset-group__list", group && group.display && `g${group.display}`)}>
                {list.map(({ id }) => (
                  <li key={id} className={cx(id === selected && "active")}>
                    <img
                      onClick={() => {
                        onSelect(id);
                        setOpen(false);
                      }}
                      className="pixelated"
                      src={tiles[id]}
                    />
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ToolbarTileset;
