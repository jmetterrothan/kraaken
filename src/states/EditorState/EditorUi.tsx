import React from "react";

import { ITileTypes, ITileGroups, ILayerId } from "@src/shared/models/tilemap.model";

import Toolbar from "@src/shared/ui/components/Toolbar";
import ToolbarButton from "@src/shared/ui/components/ToolbarButton";
import ToolbarTileset from "@src/shared/ui/components/ToolbarTileset";
import ToolbarSeparator from "@src/shared/ui/components/ToolbarSeparator";
import ToolbarSelect, { IToolbarOption } from "@src/shared/ui/components/ToolbarSelect";

import { EditorMode } from "@src/shared/models/editor.model";

import { CHANGE_TILETYPE_EVENT, CHANGE_LAYER_EVENT, CHANGE_MODE_EVENT } from "@src/shared/events/constants";

import { dispatch, modeChange, tileTypeChange, layerChange, ModeChangeEvent, TileTypeChangeEvent, LayerChangeEvent, undo, redo } from "@src/shared/events";

export default ({ sprites, sounds, level, options }) => {
  const [mode, setMode] = React.useState<EditorMode>(options.mode);
  const [layerId, setLayerId] = React.useState<number>(options.layerId);
  const [tileTypeId, setTileTypeId] = React.useState<string>(options.tileTypeId);

  const tileSet = React.useMemo(() => sprites.find((sprite) => sprite.name === level.tileMap.tileSet), []);

  const tileTypes: ITileTypes = React.useMemo(
    () =>
      level.tileMap.tileTypes.reduce((acc, val) => {
        acc[`${val.row}:${val.col}`] = val;
        return acc;
      }, {}),
    [level.tileMap.tileTypes]
  );

  const tileGroups: ITileGroups = level.tileMap.tileGroups;

  const setPlaceMode = React.useCallback(() => dispatch(modeChange(EditorMode.PLACE)), []);

  const setFillMode = React.useCallback(() => dispatch(modeChange(EditorMode.FILL)), []);

  const setEraseMode = React.useCallback(() => dispatch(modeChange(EditorMode.ERASE)), []);

  const setPickMode = React.useCallback(() => dispatch(modeChange(EditorMode.PICK)), []);

  const handleUndoClick = React.useCallback(() => {
    dispatch(undo());
  }, []);

  const handleRedoClick = React.useCallback(() => {
    dispatch(redo());
  }, []);

  const handleLayerSelection = React.useCallback((option: IToolbarOption<number>) => {
    dispatch(layerChange(option.value as ILayerId));
  }, []);

  const handleTileTypeSelection = React.useCallback((id: string) => {
    dispatch(tileTypeChange(id));
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
          disabled={false}
          onClick={handleUndoClick}
        />
        <ToolbarButton
          icon="redo" //
          name="Redo"
          active={false}
          disabled={false}
          onClick={handleRedoClick}
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
          src={tileSet.src}
          tileSize={tileSet.tileWidth}
          tileTypes={tileTypes}
          tileGroups={tileGroups}
          disabled={mode === EditorMode.ERASE}
        />
      </Toolbar>
    </div>
  );
};
