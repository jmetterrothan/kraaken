import { PropsWithChildren } from "react";
import cx from "classnames";

import ToolbarButton from "../ToolbarButton";
import TileImage from "../TileImage";
import useTileset from "./useTileset";

import "./ToolbarTileset.scss";
import { ISpriteData } from "@src/shared/models/sprite.model";

interface IToolbarTilesetProps {
  tileSet: ISpriteData;
  disabled?: boolean;
  selected: number;
  onSelect: (index: number) => void;
  onClick: () => void;
}

const ToolbarTileset = ({ tileSet, disabled, selected, onClick }: PropsWithChildren<IToolbarTilesetProps>) => {
  const { tiles } = useTileset(tileSet);
  const selectedTile = tiles[selected];

  return (
    <div className={cx("toolbar-tileset")}>
      <div className="toolbar-tileset__button">
        <ToolbarButton
          icon="square" //
          disabled={disabled}
          active={false}
          name="Texture"
          showCaret={false}
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
    </div>
  );
};

export default ToolbarTileset;
