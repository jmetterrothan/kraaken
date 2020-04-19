import React from "react";

import tilesetSrc from "@src/data/level2/assets/graphics/tileset.png";

import { ITileTypes, ITileGroups, ILayerId } from "../models/tilemap.model";

import Toolbar from "./components/Toolbar";
import ToolbarButton from "./components/ToolbarButton";
import ToolbarTileset from "./components/ToolbarTileset";
import ToolbarSelect, { IToolbarOption } from "./components/ToolbarSelect";

import { EditorMode } from "@src/shared/models/editor.model";

import { modeChange, tileTypeChange, layerChange } from "./events";

export default ({ level }) => {
  const [mode, setMode] = React.useState<EditorMode>(EditorMode.FILL);
  const [layerId, setLayerId] = React.useState<number>(1);
  const [tileTypeId, setTileTypeId] = React.useState<string>("20:1");

  const tileTypes: ITileTypes = React.useMemo(
    () =>
      level.tileMap.tileTypes.reduce((acc, val) => {
        acc[`${val.row}:${val.col}`] = val;
        return acc;
      }, {}),
    [level.tileMap.tileTypes]
  );

  const tileGroups: ITileGroups = level.tileMap.tileGroups;

  const setFillMode = () => setMode(EditorMode.FILL);

  const setEraseMode = () => setMode(EditorMode.ERASE);

  const handleLayerSelection = (option: IToolbarOption<number>) => {
    setLayerId(option.value);
  };

  React.useEffect(() => {
    window.dispatchEvent(modeChange(mode));
  }, [mode]);

  React.useEffect(() => {
    window.dispatchEvent(tileTypeChange(tileTypeId));
  }, [tileTypeId]);

  React.useEffect(() => {
    window.dispatchEvent(layerChange(layerId as ILayerId));
  }, [layerId]);

  return (
    <div className="ui">
      <Toolbar>
        <ToolbarButton
          icon="fill" //
          name="Fill"
          active={mode === EditorMode.FILL}
          onClick={setFillMode}
        />
        <ToolbarButton
          icon="eraser" //
          name="Erase"
          theme="red"
          active={mode === EditorMode.ERASE}
          onClick={setEraseMode}
        />
        <ToolbarSelect<number>
          icon="layer-group" //
          active={false}
          selected={layerId}
          onItemClick={handleLayerSelection}
          options={[
            { name: "Layer 0", value: 0 },
            { name: "Layer 1", value: 1 },
            { name: "Layer 2", value: 2 },
          ]}
        />
        <ToolbarTileset
          selected={tileTypeId} //
          onSelect={setTileTypeId}
          src={tilesetSrc}
          tileSize={16}
          tileTypes={tileTypes}
          tileGroups={tileGroups}
        />
      </Toolbar>
    </div>
  );
};
