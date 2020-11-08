import React from "react";
import cx from "classnames";

import { ITileTypeData } from "@shared/models/tilemap.model";

import * as GameEventTypes from "@shared/events/constants";
import * as GameEvents from "@shared/events";

import { registerEvent } from "@shared/utility/Utility";

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
  mostFrequentlyUsedTiles: Record<number, number>;
  scale?: number;
}

const ToolbarTileset: React.FC<IToolbarTilesetProps> = ({ disabled, selected, onSelect, src, tileSize, tileTypes, mostFrequentlyUsedTiles = {} }) => {
  const ref = React.useRef<HTMLDivElement>(null);

  const [open, setOpen] = React.useState(false);

  const [history, setHistory] = React.useState<Record<number, number>>(mostFrequentlyUsedTiles);

  const tiles = useTileset(src, tileSize, tileTypes);
  const selectedTile = tiles.find((tile) => tile.index === selected);

  const list = React.useMemo(() => {
    return Object.entries(history)
      .sort((a, b) => {
        return b[1] - a[1];
      })
      .slice(0, 16)
      .map(([index]) => {
        return tiles.find((tile) => tile.index === parseInt(index, 10));
      })
      .filter((tile) => typeof tile !== "undefined");
  }, [history, tiles]);

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

  React.useEffect(() => {
    const unsubscribe = registerEvent(GameEventTypes.PLACE_EVENT, (e: GameEvents.PlaceEvent) => {
      const { tileTypeId } = e.detail || {};

      setHistory((temp) => ({
        ...temp,
        [tileTypeId]: temp[tileTypeId] + 1,
      }));
    });

    return unsubscribe;
  }, []);

  return (
    <div
      ref={ref} //
      className={cx("toolbar-tileset", open && "open")}
      onMouseEnter={!disabled ? () => setOpen(true) : undefined}
      onMouseLeave={!disabled ? () => setOpen(false) : undefined}
    >
      <div className="toolbar-tileset__button">
        <ToolbarButton
          icon="alien-monster" //
          disabled={disabled}
          active={false}
          name="Texture"
          showCaret={true}
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
        <div className="toolbar-tileset-group">
          <h4 className="toolbar-tileset-group__title">Most frequently used</h4>
          <ul className="toolbar-tileset-group__list">
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
        <div className="toolbar-tileset-group">
          <h4 className="toolbar-tileset-group__title">All tiles</h4>
          <ul className="toolbar-tileset-group__list">
            {tiles.map(({ index, row, col, subImage }) => (
              <li key={index} className={cx(index === selected && "active")}>
                <TileImage
                  title={`row: ${row}, col: ${col}, index: ${index}`}
                  src={subImage}
                  onClick={() => {
                    onSelect(index);
                    setOpen(false);
                    setHistory((temp) => ({
                      ...temp,
                      [index]: temp[index] + 1,
                    }));
                  }}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ToolbarTileset;
