import React from "react";
import cx from "classnames";

import { ITileTypeData } from "@src/shared/models/tilemap.model";

import ToolbarButton from "../ToolbarButton";

import "./ToolbarTileset.scss";

interface IToolbarTilesetProps {
  selected: string;
  onSelect: (id: string) => void;
  src: string;
  tileSize: number;
  tileTypes: Record<string, ITileTypeData>;
  scale?: number;
}

const ToolbarTileset: React.FunctionComponent<IToolbarTilesetProps> = ({ selected, onSelect, src, tileSize, tileTypes }) => {
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
    <div ref={ref} className={cx("toolbar-tileset", open && "open")}>
      <ToolbarButton icon="alien-monster" active={false} name="Select Texture" showCaret={true} onClick={handleBtnClick} />
      {open && (
        <div className="toolbar-tileset__inner">
          {groups.map((group) => {
            const list = data.filter((item) => item.group === group);
            return (
              <div key={group} className="toolbar-tileset-group">
                <h4 className="toolbar-tileset-group__title">{group}</h4>
                <ul className="toolbar-tileset-group__list">
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
      )}
    </div>
  );
};

export default ToolbarTileset;
