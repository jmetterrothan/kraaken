import React from "react";
import cx from "classnames";

import * as GameEventTypes from "@shared/events/constants";
import * as GameEvents from "@shared/events";

import { registerEvent } from "@shared/utility/Utility";

import ToolbarButton from "../ToolbarButton";
import TileImage from "../TileImage";
import useTileset, { IToolbarTilesetItem } from "./useTileset";

import "./ToolbarTileset.scss";

interface IToolbarTilesetProps {
  disabled?: boolean;
  selected: number;
  onSelect: (index: number) => void;
  onClick: () => void;
  src: string;
  tileSize: number;
  mostFrequentlyUsedTiles: Record<number, number>;
  scale?: number;
  gapSize?: number;
}

const ToolbarTileset: React.FC<IToolbarTilesetProps> = ({ disabled, selected, onSelect, onClick, src, tileSize, mostFrequentlyUsedTiles = {} }) => {
  const ref = React.useRef<HTMLDivElement>(null);

  const [open, setOpen] = React.useState(false);

  const [lastUsed, setLastUsed] = React.useState<number[]>([]);
  const [history, setHistory] = React.useState<Record<number, number>>(mostFrequentlyUsedTiles);

  const { tiles } = useTileset(src, tileSize);
  const selectedTile = tiles.find((tile) => tile.index === selected);

  const list = React.useMemo(() => {
    return Object.entries(history)
      .sort((a, b) => {
        return b[1] - a[1];
      })
      .slice(0, 32)
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

      // update last used
      setLastUsed((old) => {
        const temp = [...old];
        const i = temp.findIndex((id) => id === tileTypeId);

        if (i === -1) {
          if (temp.length >= 8) {
            temp.pop();
          }
        } else {
          temp.splice(i, 1);
        }

        temp.unshift(tileTypeId);

        return temp;
      });
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
          icon="square" //
          disabled={disabled}
          active={false}
          name="Texture"
          showCaret={true}
          onClick={onClick}
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
        {lastUsed.length > 0 && (
          <div className="toolbar-tileset-group">
            <h4 className="toolbar-tileset-group__title">Last used</h4>
            <ul className="toolbar-tileset-group__list">
              {lastUsed
                .map((id) => tiles.find((tile) => id === tile.index))
                .filter((tile) => typeof tile !== "undefined")
                .map(({ index, row, col, subImage }) => (
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
        )}
        {tiles.length > 0 && (
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
        )}
        <footer className="toolbar-tileset__footer">
          <button className="button" onClick={onClick}>
            Show more
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ToolbarTileset;
