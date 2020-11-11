import React from "react";

import Ui from "@src/shared/ui";
import Toolbar from "@src/shared/ui/components/Toolbar";
import ToolbarButton from "@src/shared/ui/components/ToolbarButton";
import ToolbarTileset from "@src/shared/ui/components/ToolbarTileset";
import ToolbarSeparator from "@src/shared/ui/components/ToolbarSeparator";
import ToolbarSelect from "@src/shared/ui/components/ToolbarSelect";

import { TileLayer } from "@src/shared/models/tilemap.model";
import { EditorMode, EditorTerrainMode } from "@src/shared/models/editor.model";
import { IWorldBlueprint } from "@src/shared/models/world.model";

import dispatch, * as GameEvents from "@src/shared/events";

import UndoToolbarButton from "./UndoToolbarButton";
import RedoToolbarButton from "./RedoToolbarButton";
import ZoomToolbarSelect from "./ZoomToolbarSelect";
import editorStore from "./editorStore";

interface EditorUiProps {
  levelId: string;
  blueprint: IWorldBlueprint;
}

const useEditorActions = () => {
  return React.useMemo(
    () => ({
      undo: () => dispatch(GameEvents.undoEvent()),
      redo: () => dispatch(GameEvents.redoEvent()),
      play: (id: string) => dispatch(GameEvents.playEvent(id)),
      save: (id: string) => dispatch(GameEvents.saveEvent(id)),
    }),
    []
  );
};

const EditorUi: React.FC<EditorUiProps> = ({ levelId, blueprint }) => {
  const { level, sprites } = blueprint;

  const actions = useEditorActions();

  const tileSet = React.useMemo(() => sprites.find((sprite) => sprite.name === level.tileSet), []);

  const mostFrequentlyUsedTiles = React.useMemo(() => {
    const tileTypeIndexes = [...blueprint.level.layers[TileLayer.L1], ...blueprint.level.layers[TileLayer.L2]];

    return tileTypeIndexes.reduce((acc, index) => {
      if (index !== 0) {
        if (typeof acc[index] === "undefined") {
          acc[index] = 0;
        }
        acc[index]++;
      }
      return acc;
    }, {});
  }, [blueprint]);

  const entities = React.useMemo(() => {
    return blueprint.entities
      .filter((entity) => entity.components.find((component) => component.name === "edit_mode")) //
      .map((entity) => ({ name: entity.type, value: entity.type }));
  }, [blueprint]);

  const [state, setState] = React.useState(editorStore.initialState);

  React.useLayoutEffect(() => {
    const sub = editorStore.subscribe(setState);

    return () => sub.unsubscribe();
  }, []);

  const terrainOptions = (
    <>
      <ToolbarButton
        icon="brush" //
        name="Place"
        active={state.terrainMode === EditorTerrainMode.PLACE}
        onClick={() => editorStore.setTerrainMode(EditorTerrainMode.PLACE)}
      />
      <ToolbarButton
        icon="fill" //
        name="Fill"
        active={state.terrainMode === EditorTerrainMode.FILL}
        onClick={() => editorStore.setTerrainMode(EditorTerrainMode.FILL)}
      />
      <ToolbarButton
        icon="eraser" //
        name="Erase"
        theme="red"
        active={state.terrainMode === EditorTerrainMode.ERASE}
        onClick={() => editorStore.setTerrainMode(EditorTerrainMode.ERASE)}
      />
      <ToolbarButton
        icon="eye-dropper" //
        name="Pick"
        active={state.terrainMode === EditorTerrainMode.PICK}
        onClick={() => editorStore.setTerrainMode(EditorTerrainMode.PICK)}
      />
      <ToolbarSelect<number>
        icon="layer-group" //
        selected={state.layerId}
        active={false}
        onItemClick={(option) => editorStore.setSelectedLayerId(option.value)}
        options={[
          { name: "Layer 1", description: "(with collision)", value: TileLayer.L1 },
          { name: "Layer 2", value: TileLayer.L2 },
        ]}
      />
      <ToolbarTileset
        selected={state.tileTypeId} //
        onSelect={editorStore.setSelectedTileTypeId}
        src={tileSet.src}
        tileSize={tileSet.tileWidth}
        tileTypes={level.tileTypes}
        mostFrequentlyUsedTiles={mostFrequentlyUsedTiles}
        disabled={state.terrainMode === EditorTerrainMode.ERASE}
      />
    </>
  );

  const entityOptions = (
    <>
      <ToolbarSelect<string>
        icon="hat-wizard" //
        selected={state.entityType}
        active={false}
        onItemClick={(option) => editorStore.setSelectedEntityType(option.value)}
        options={entities}
      />
    </>
  );

  return (
    <Ui>
      <Toolbar>
        <div>
          <ToolbarButton
            name={state.mode === EditorMode.ENTITY ? "Terrain mode" : "Entity mode"} //
            active={false}
            onClick={() => editorStore.setMode(state.mode === EditorMode.TERRAIN ? EditorMode.ENTITY : EditorMode.TERRAIN)}
          />
          <ToolbarSeparator />
          {state.mode === EditorMode.TERRAIN ? terrainOptions : entityOptions}
          <ToolbarSeparator />
          <ZoomToolbarSelect value={state.scale} onClick={(option) => editorStore.setScale(option.value)} />
          <ToolbarSeparator />
          <UndoToolbarButton onClick={actions.undo} />
          <RedoToolbarButton onClick={actions.redo} />
        </div>
        <div>
          <ToolbarButton
            icon="save" //
            name="Save"
            active={false}
            onClick={() => actions.save(levelId)}
          />
          <ToolbarButton
            icon="play" //
            name="Play level"
            active={false}
            onClick={() => actions.play(levelId)}
          />
        </div>
      </Toolbar>
    </Ui>
  );
};

export default EditorUi;
