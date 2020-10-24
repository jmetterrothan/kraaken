import React from "react";

import { ITileTypes, ITileGroups, ILayerId } from "@src/shared/models/tilemap.model";

import Ui from "@src/shared/ui";
import Toolbar from "@src/shared/ui/components/Toolbar";
import ToolbarButton from "@src/shared/ui/components/ToolbarButton";
import ToolbarTileset from "@src/shared/ui/components/ToolbarTileset";
import ToolbarSeparator from "@src/shared/ui/components/ToolbarSeparator";
import ToolbarSelect, { IToolbarOption } from "@src/shared/ui/components/ToolbarSelect";

import { EditorMode } from "@src/shared/models/editor.model";
import { ISoundData } from "@src/shared/models/sound.model";
import { ISpriteData } from "@src/shared/models/sprite.model";
import { IWorldBlueprint } from "@src/shared/models/world.model";

import { CHANGE_TILETYPE_EVENT, CHANGE_LAYER_EVENT, CHANGE_MODE_EVENT } from "@src/shared/events/constants";

import { dispatch, modeChangeEvent, tileTypeChangeEvent, layerChangeEvent, ModeChangeEvent, TileTypeChangeEvent, LayerChangeEvent, undoEvent, redoEvent, playEvent } from "@src/shared/events";

import { registerEvent } from "@shared/utility/Utility";

interface EditorUiProps {
  sprites: ISpriteData[];
  sounds: ISoundData[];
  level: IWorldBlueprint["level"];
  options: {
    mode: EditorMode;
    layerId: number;
    tileTypeId: string;
  };
}

const useEditorActions = () => {
  return React.useMemo(
    () => ({
      setPlaceMode: () => dispatch(modeChangeEvent(EditorMode.PLACE)),
      setFillMode: () => dispatch(modeChangeEvent(EditorMode.FILL)),
      setEraseMode: () => dispatch(modeChangeEvent(EditorMode.ERASE)),
      setPickMode: () => dispatch(modeChangeEvent(EditorMode.PICK)),
      undo: () => dispatch(undoEvent()),
      redo: () => dispatch(redoEvent()),
      selectLayer: (option: IToolbarOption<number>) => dispatch(layerChangeEvent(option.value as ILayerId)),
      selectTileType: (id: string) => dispatch(tileTypeChangeEvent(id)),
      play: (id: number) => dispatch(playEvent(id)),
    }),
    []
  );
};

const EditorUi: React.FC<EditorUiProps> = ({ sprites, sounds, level, options }) => {
  const [mode, setMode] = React.useState<EditorMode>(options.mode);
  const [layerId, setLayerId] = React.useState<number>(options.layerId);
  const [tileTypeId, setTileTypeId] = React.useState<string>(options.tileTypeId);

  const actions = useEditorActions();

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

  React.useEffect(() => {
    const unsubFromChangeModeEvent = registerEvent(CHANGE_MODE_EVENT, (e: ModeChangeEvent) => {
      setMode(e.detail.mode);
    });

    const unsubFromChangeTiletypeEvent = registerEvent(CHANGE_TILETYPE_EVENT, (e: TileTypeChangeEvent) => {
      setTileTypeId(e.detail.id);
    });

    const unsubFromChangeLayerEvent = registerEvent(CHANGE_LAYER_EVENT, (e: LayerChangeEvent) => {
      setLayerId(e.detail.id);
    });

    return () => {
      unsubFromChangeModeEvent();
      unsubFromChangeTiletypeEvent();
      unsubFromChangeLayerEvent();
    };
  }, []);

  return (
    <Ui>
      <Toolbar>
        <ToolbarButton
          icon="play" //
          name="Play level"
          active={false}
          onClick={() => actions.play(0)}
        />
        <ToolbarButton
          icon="brush" //
          name="Place"
          active={mode === EditorMode.PLACE}
          onClick={actions.setPlaceMode}
        />
        <ToolbarButton
          icon="fill" //
          name="Fill"
          active={mode === EditorMode.FILL}
          onClick={actions.setFillMode}
        />
        <ToolbarButton
          icon="eraser" //
          name="Erase"
          theme="red"
          active={mode === EditorMode.ERASE}
          onClick={actions.setEraseMode}
        />
        <ToolbarButton
          icon="eye-dropper" //
          name="Pick"
          active={mode === EditorMode.PICK}
          onClick={actions.setPickMode}
        />
        <ToolbarSeparator />
        <ToolbarButton
          icon="undo" //
          name="Undo"
          active={false}
          disabled={false}
          onClick={actions.undo}
        />
        <ToolbarButton
          icon="redo" //
          name="Redo"
          active={false}
          disabled={false}
          onClick={actions.redo}
        />
        <ToolbarSeparator />
        <ToolbarSelect<number>
          icon="layer-group" //
          selected={layerId}
          active={false}
          onItemClick={actions.selectLayer}
          options={[
            { name: "Layer 1", value: 1 },
            { name: "Layer 2", value: 2 },
          ]}
        />
        <ToolbarTileset
          selected={tileTypeId} //
          onSelect={actions.selectTileType}
          src={tileSet.src}
          tileSize={tileSet.tileWidth}
          tileTypes={tileTypes}
          tileGroups={tileGroups}
          disabled={mode === EditorMode.ERASE}
        />
      </Toolbar>
    </Ui>
  );
};

export default EditorUi;
