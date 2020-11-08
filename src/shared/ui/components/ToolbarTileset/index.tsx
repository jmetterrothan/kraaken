import React from "react";
import cx from "classnames";

import { ITileTypeData, ITileTypeGroup } from "@src/shared/models/tilemap.model";

import ToolbarButton from "../ToolbarButton";
import TileImage from "../TileImage";
import useTileset from "./useTileset";

import "./ToolbarTileset.scss";

interface IToolbarTilesetProps {
  disabled?: boolean;
  selected: number;
  onSelect: (index: number) => void;
  src: string;
  tileSize: number;
  tileTypes: ITileTypeData[];
  tileGroups: ITileTypeGroup[];
  scale?: number;
}

const ToolbarTileset: React.FC<IToolbarTilesetProps> = ({ disabled, selected, onSelect, src, tileSize, tileTypes, tileGroups }) => {
  const ref = React.useRef<HTMLDivElement>(null);

  const [open, setOpen] = React.useState(false);

  const tiles = useTileset(src, tileSize, tileTypes);

  const selectedTile = tiles.find((tile) => tile.index === selected);
  console.log(selectedTile);
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

  return (
    <div ref={ref} className={cx("toolbar-tileset", open && "open")}>
      <div className="toolbar-tileset__button">
        <ToolbarButton
          icon="alien-monster" //
          disabled={disabled}
          active={false}
          name="Select Texture"
          showCaret={true}
          onClick={handleBtnClick}
        >
          {selectedTile && (
            <TileImage //
              title={`row: ${selectedTile.row}, col: ${selectedTile.col}, index: ${selectedTile.index}`}
              src={selectedTile.subImage}
            />
          )}
        </ToolbarButton>
      </div>
      <div className="toolbar-tileset__inner">
        {tileGroups.map((group) => {
          const list = tiles.filter((tile) => {
            return tile.group === group.id;
          });

          return (
            <div key={group.id} className="toolbar-tileset-group">
              <h4 className="toolbar-tileset-group__title">{group.name || `[${group.id}]`}</h4>
              <ul className={cx("toolbar-tileset-group__list", group.display && `g${group.display}`)}>
                {list.map(({ index, row, col, subImage }) => (
                  <li key={index} className={cx(index === selected && "active")}>
                    <TileImage
                      title={`row: ${row}, col: ${col}, index: ${index}`}
                      src={subImage}
                      onClick={() => {
                        onSelect(index);
                        setOpen(false);
                      }}
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
