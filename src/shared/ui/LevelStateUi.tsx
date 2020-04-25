import React from "react";

import tilesetSrc from "@src/data/level2/assets/graphics/tileset.png";

import { ITileTypes, ITileGroups, ILayerId } from "../models/tilemap.model";

import Toolbar from "./components/Toolbar";
import ToolbarButton from "./components/ToolbarButton";
import ToolbarTileset from "./components/ToolbarTileset";
import ToolbarSeparator from "./components/ToolbarSeparator";
import ToolbarSelect, { IToolbarOption } from "./components/ToolbarSelect";

import { EditorMode } from "@src/shared/models/editor.model";

import { modeChange, tileTypeChange, layerChange, CHANGE_MODE_EVENT, CHANGE_TILETYPE_EVENT, CHANGE_LAYER_EVENT, ModeChangeEvent, TileTypeChangeEvent, LayerChangeEvent } from "./events";

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

  const setPlaceMode = React.useCallback(() => window.dispatchEvent(modeChange(EditorMode.PLACE)), []);

  const setFillMode = React.useCallback(() => window.dispatchEvent(modeChange(EditorMode.FILL)), []);

  const setEraseMode = React.useCallback(() => window.dispatchEvent(modeChange(EditorMode.ERASE)), []);

  const setPickMode = React.useCallback(() => window.dispatchEvent(modeChange(EditorMode.PICK)), []);

  const handleLayerSelection = React.useCallback((option: IToolbarOption<number>) => {
    window.dispatchEvent(layerChange(option.value as ILayerId));
  }, []);

  const handleTileTypeSelection = React.useCallback((id: string) => {
    window.dispatchEvent(tileTypeChange(id));
  }, []);

  React.useEffect(() => {
    window.addEventListener(CHANGE_MODE_EVENT, (e: ModeChangeEvent) => {
      setMode(e.detail.mode);
    });

    window.addEventListener(CHANGE_TILETYPE_EVENT, (e: TileTypeChangeEvent) => {
      setTileTypeId(e.detail.id);
    });

    window.addEventListener(CHANGE_LAYER_EVENT, (e: LayerChangeEvent) => {
      setLayerId(e.detail.id);
    });
  }, []);

  return (
    <div className="ui">
      <Toolbar>
        <ToolbarButton
          icon="brush" //
          name="Place"
          active={mode === EditorMode.PLACE}
          onClick={setPlaceMode}
        />
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
        <ToolbarButton
          icon="eye-dropper" //
          name="Pick"
          active={mode === EditorMode.PICK}
          onClick={setPickMode}
        />
        <ToolbarSeparator />
        <ToolbarButton
          icon="undo" //
          name="Undo"
          active={false}
          disabled={true}
          onClick={undefined}
        />
        <ToolbarButton
          icon="redo" //
          name="Redo"
          active={false}
          disabled={true}
          onClick={undefined}
        />
        <ToolbarSeparator />
        <ToolbarSelect<number>
          icon="layer-group" //
          selected={layerId}
          active={false}
          onItemClick={handleLayerSelection}
          options={[
            { name: "Layer 1", value: 1 },
            { name: "Layer 2", value: 2 },
          ]}
        />
        <ToolbarTileset
          selected={tileTypeId} //
          onSelect={handleTileTypeSelection}
          src={tilesetSrc}
          tileSize={16}
          tileTypes={tileTypes}
          tileGroups={tileGroups}
        />
      </Toolbar>
    </div>
  );
};
