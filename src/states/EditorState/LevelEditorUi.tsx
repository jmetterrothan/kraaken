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

import { CHANGE_TILETYPE_EVENT, CHANGE_LAYER_EVENT, CHANGE_MODE_EVENT } from "@src/shared/events/constants";

import { dispatch, saveEvent, modeChangeEvent, tileTypeChangeEvent, layerChangeEvent, ModeChangeEvent, TileTypeChangeEvent, LayerChangeEvent, undoEvent, redoEvent, playEvent } from "@src/shared/events";

import { registerEvent } from "@shared/utility/Utility";

import eventStackSvc from "@src/shared/services/EventStackService";

interface EditorUiProps {
  levelId: string;
  blueprint: IWorldBlueprint;
  options: {
    mode: EditorMode;
    layerId: number;
    tileTypeIndex: number;
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
      selectTileType: (index: number) => dispatch(tileTypeChangeEvent(index)),
      play: (id: string) => dispatch(playEvent(id)),
      save: (id: string) => dispatch(saveEvent(id)),
    }),
    []
  );
};

const EditorUi: React.FC<EditorUiProps> = ({ levelId, blueprint, options }) => {
  const { level, sprites } = blueprint;

  const [undoStackSize, setUndoStackSize] = React.useState(0);
  const [redoStackSize, setRedoStackSize] = React.useState(0);

  const [mode, setMode] = React.useState<EditorMode>(options.mode);
  const [layerId, setLayerId] = React.useState<number>(options.layerId);
  const [tileTypeIndex, setTileTypeIndex] = React.useState<number>(options.tileTypeIndex);

  const actions = useEditorActions();

  const tileSet = React.useMemo(() => sprites.find((sprite) => sprite.name === level.tileSet), []);

  React.useEffect(() => {
    const unsubFromChangeModeEvent = registerEvent(CHANGE_MODE_EVENT, (e: ModeChangeEvent) => {
      setMode(e.detail.mode);
    });

    const unsubFromChangeTiletypeEvent = registerEvent(CHANGE_TILETYPE_EVENT, (e: TileTypeChangeEvent) => {
      setTileTypeIndex(e.detail.index);
    });

    const unsubFromChangeLayerEvent = registerEvent(CHANGE_LAYER_EVENT, (e: LayerChangeEvent) => {
      setLayerId(e.detail.id);
    });

    const eventStackChangeSub = eventStackSvc.subscribe(() => {
      setUndoStackSize(eventStackSvc.undoStack.length);
      setRedoStackSize(eventStackSvc.redoStack.length);
    });

    return () => {
      unsubFromChangeModeEvent();
      unsubFromChangeTiletypeEvent();
      unsubFromChangeLayerEvent();

      eventStackChangeSub.unsubscribe();
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
        <ToolbarButton
          icon="undo" //
          name="Undo"
          active={false}
          disabled={undoStackSize === 0}
          onClick={actions.undo}
        />
        <ToolbarButton
          icon="redo" //
          name="Redo"
          active={false}
          disabled={redoStackSize === 0}
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
