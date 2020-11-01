import React from "react";

import Ui from "@src/shared/ui";
import Toolbar from "@src/shared/ui/components/Toolbar";
import ToolbarButton from "@src/shared/ui/components/ToolbarButton";
import ToolbarTileset from "@src/shared/ui/components/ToolbarTileset";
import ToolbarSeparator from "@src/shared/ui/components/ToolbarSeparator";
import ToolbarSelect, { IToolbarOption } from "@src/shared/ui/components/ToolbarSelect";

import { ILayerId } from "@src/shared/models/tilemap.model";
import { EditorMode } from "@src/shared/models/editor.model";
import { IWorldBlueprint } from "@src/shared/models/world.model";

import * as GameEventTypes from "@src/shared/events/constants";
import dispatch, * as GameEvents from "@src/shared/events";

import { registerEvent } from "@shared/utility/Utility";

import UndoToolbarButton from "./UndoToolbarButton";
import RedoToolbarButton from "./RedoToolbarButton";
import ZoomToolbarSelect from "./ZoomToolbarSelect";

interface EditorUiProps {
  levelId: string;
  blueprint: IWorldBlueprint;
  options: {
    scale: number;
    mode: EditorMode;
    layerId: number;
    tileTypeIndex: number;
  };
}

const useEditorActions = () => {
  return React.useMemo(
    () => ({
      setPlaceMode: () => dispatch(GameEvents.modeChangeEvent(EditorMode.PLACE)),
      setFillMode: () => dispatch(GameEvents.modeChangeEvent(EditorMode.FILL)),
      setEraseMode: () => dispatch(GameEvents.modeChangeEvent(EditorMode.ERASE)),
      setPickMode: () => dispatch(GameEvents.modeChangeEvent(EditorMode.PICK)),
      undo: () => dispatch(GameEvents.undoEvent()),
      redo: () => dispatch(GameEvents.redoEvent()),
      selectLayer: (option: IToolbarOption<number>) => dispatch(GameEvents.layerChangeEvent(option.value as ILayerId)),
      selectTileType: (index: number) => dispatch(GameEvents.tileTypeChangeEvent(index)),
      play: (id: string) => dispatch(GameEvents.playEvent(id)),
      save: (id: string) => dispatch(GameEvents.saveEvent(id)),
      zoom: (option: IToolbarOption<number>) => dispatch(GameEvents.zoomEvent(option.value)),
    }),
    []
  );
};

const EditorUi: React.FC<EditorUiProps> = ({ levelId, blueprint, options }) => {
  const { level, sprites } = blueprint;

  const [mode, setMode] = React.useState<EditorMode>(options.mode);
  const [layerId, setLayerId] = React.useState<number>(options.layerId);
  const [tileTypeIndex, setTileTypeIndex] = React.useState<number>(options.tileTypeIndex);

  const actions = useEditorActions();

  const tileSet = React.useMemo(() => sprites.find((sprite) => sprite.name === level.tileSet), []);

  React.useEffect(() => {
    /**
     * TODO: Those listeners are not reliable because they contain raw data in the details,
     * they should all related to an rxjs subscription in order to listen to the
     * real value change in the game
     */
    const unsubFromChangeModeEvent = registerEvent(GameEventTypes.CHANGE_MODE_EVENT, (e: GameEvents.ModeChangeEvent) => {
      setMode(e.detail.mode);
    });

    const unsubFromChangeTiletypeEvent = registerEvent(GameEventTypes.CHANGE_TILETYPE_EVENT, (e: GameEvents.TileTypeChangeEvent) => {
      setTileTypeIndex(e.detail.index);
    });

    const unsubFromChangeLayerEvent = registerEvent(GameEventTypes.CHANGE_LAYER_EVENT, (e: GameEvents.LayerChangeEvent) => {
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
          onClick={() => actions.play(levelId)}
        />
        <ToolbarSeparator />
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
        <UndoToolbarButton onClick={actions.undo} />
        <RedoToolbarButton onClick={actions.redo} />
        <ToolbarSeparator />
        <ZoomToolbarSelect onClick={actions.zoom} />
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
        <ToolbarSeparator />
        <ToolbarTileset
          selected={tileTypeIndex} //
          onSelect={actions.selectTileType}
          src={tileSet.src}
          tileSize={tileSet.tileWidth}
          tileTypes={level.tileTypes}
          tileGroups={level.tileGroups}
          disabled={mode === EditorMode.ERASE}
        />
        <ToolbarSeparator />
        <ToolbarButton
          icon="save" //
          name="Save"
          active={false}
          onClick={() => actions.save(levelId)}
        />
      </Toolbar>
    </Ui>
  );
};

export default EditorUi;
