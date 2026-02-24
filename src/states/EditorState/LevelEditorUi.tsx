import React, { Suspense, useEffect } from "react";

import Ui from "@src/shared/ui";
import Toolbar from "@src/shared/ui/components/Toolbar";
import ToolbarButton from "@src/shared/ui/components/ToolbarButton";
import ToolbarTileset from "@src/shared/ui/components/ToolbarTileset";
import ToolbarSeparator from "@src/shared/ui/components/ToolbarSeparator";
import ToolbarSelect from "@src/shared/ui/components/ToolbarSelect";
import Modal, { useModal } from "@src/shared/ui/components/Modal";

import { TileLayer } from "@src/shared/models/tilemap.model";
import { EditorMode, EditorTerrainMode } from "@src/shared/models/editor.model";
import { IProjectBlueprint } from "@src/shared/models/world.model";

import dispatch, * as GameEvents from "@src/shared/events";

import UndoToolbarButton from "./UndoToolbarButton";
import RedoToolbarButton from "./RedoToolbarButton";
import ZoomToolbarSelect from "./ZoomToolbarSelect";

import editorStore, { IEditorStoreState } from "./editorStore";

import keyBindings from "@src/keyBindings";
import TerrainModeSidePanel from "@src/shared/ui/components/TerrainModeSidePanel";
import EntityModeSidePanel from "@src/shared/ui/components/EntityModeSidePanel";

interface EditorUiProps {
  projectId: string;
  levelId: string | null;
  blueprint: IProjectBlueprint;
}

const useEditorActions = () => {
  return React.useMemo(
    () => ({
      undo: () => dispatch(GameEvents.undoEvent()),
      redo: () => dispatch(GameEvents.redoEvent()),
      play: (projectId: string, levelId: string | null) => dispatch(GameEvents.playEvent(projectId, levelId)),
      save: (projectId: string) => dispatch(GameEvents.saveEvent(projectId)),
    }),
    []
  );
};

// TODO: add props
type ToolbarModeProps = {
  editorState: IEditorStoreState;
  modal: any;
  tileSet: any;
};

const ToolbarMode = ({ editorState, modal, tileSet }: ToolbarModeProps) => {
  switch (editorState.mode) {
    case EditorMode.ENTITY:
      return null;

    case EditorMode.COLLISION:
      return null;

    case EditorMode.TERRAIN:
      return (
        <>
          <ToolbarButton
            icon="brush" //
            name="Place"
            kbd={keyBindings.editor.place.toString()}
            active={editorState.terrainMode === EditorTerrainMode.PLACE}
            onClick={() => editorStore.setTerrainMode(EditorTerrainMode.PLACE)}
          />
          <ToolbarButton
            icon="fill" //
            name="Fill"
            kbd={keyBindings.editor.fill.toString()}
            active={editorState.terrainMode === EditorTerrainMode.FILL}
            onClick={() => editorStore.setTerrainMode(EditorTerrainMode.FILL)}
          />
          <ToolbarButton
            icon="eraser" //
            name="Erase"
            theme="red"
            kbd={keyBindings.editor.erase.toString()}
            active={editorState.terrainMode === EditorTerrainMode.ERASE}
            onClick={() => editorStore.setTerrainMode(EditorTerrainMode.ERASE)}
          />
          <ToolbarButton
            icon="eye-dropper" //
            name="Pick"
            kbd={keyBindings.editor.pick.toString()}
            active={editorState.terrainMode === EditorTerrainMode.PICK}
            onClick={() => editorStore.setTerrainMode(EditorTerrainMode.PICK)}
          />
          <ToolbarSeparator />
          <ToolbarSelect<number>
            icon="layer-group" //
            selected={editorState.layerId}
            active={false}
            onItemClick={(option) => editorStore.setSelectedLayerId(option.value)}
            options={[
              { name: "Primary layer", description: "", value: TileLayer.L1 },
              { name: "Secondary layer", description: "", value: TileLayer.L2 },
            ]}
          />
          <Suspense>
            <ToolbarTileset
              selected={editorState.tileSelection[tileSet.name]?.tileTypeId ?? 0} //
              onSelect={editorStore.setSelectedTileTypeId}
              tileSet={tileSet}
              disabled={editorState.terrainMode === EditorTerrainMode.ERASE}
              onClick={modal.open}
            />
          </Suspense>
        </>
      );

    default:
      return null;
  }
};

const EditorUi: React.FC<EditorUiProps> = ({ projectId, blueprint, levelId = blueprint.defaultLevelId }) => {
  const [editorState, setEditorState] = React.useState(editorStore.initialState);

  const { assets, levels } = blueprint;

  const actions = useEditorActions();

  const modal = useModal();

  const level = levels.find((level) => level.id === levelId);

  const tileSetName = level?.layers[editorState.layerId].tileSet;

  const tileSet = React.useMemo(
    () =>
      assets.sprites.find((sprite) => sprite.name === tileSetName) ?? {
        src: "",
        name: "",
        tileHeight: 0,
        tileWidth: 0,
        defaultTileIndex: null,
      },
    [tileSetName]
  );

  const tileTypeId = editorState.tileSelection[tileSet.name]?.tileTypeId ?? 0;

  React.useLayoutEffect(() => {
    const editorSub = editorStore.subscribe(setEditorState);

    return () => {
      editorSub.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (tileSet.defaultTileIndex) {
      editorStore.setSelectedTileTypeId(tileSet.name, tileSet.defaultTileIndex);
    }
  }, [tileSet.defaultTileIndex]);

  return (
    <Ui>
      <Suspense>
        <Modal selected={tileTypeId} tileSet={tileSet} isOpen={modal.isOpen} onClose={modal.close} onSelect={editorStore.setSelectedTileTypeId} />
      </Suspense>
      <Toolbar>
        <div>
          <ToolbarSelect<number>
            selected={editorState.mode}
            onItemClick={(option) => editorStore.setMode(option.value)}
            active={true}
            options={[
              { value: EditorMode.TERRAIN, name: "Painting mode" },
              { value: EditorMode.ENTITY, name: "Entity mode" },
              { value: EditorMode.COLLISION, name: "Collision mode" },
            ]}
          />
          <ToolbarSeparator />
          <ToolbarMode
            editorState={editorState} //
            tileSet={tileSet}
            modal={modal}
          />
        </div>
        <div>
          <ZoomToolbarSelect
            value={editorState.scale} //
            onClick={(option) => editorStore.setScale(option.value)}
          />
          <ToolbarSeparator />
          <UndoToolbarButton onClick={actions.undo} />
          <RedoToolbarButton onClick={actions.redo} />
          <ToolbarSeparator />
          <ToolbarButton
            icon="save" //
            name="Save"
            kbd={keyBindings.editor.save.toString()}
            disabled={editorState.loading}
            active={false}
            onClick={() => actions.save(projectId)}
          />
          <ToolbarButton
            icon="play" //
            name="Play"
            kbd={keyBindings.editor.play.toString()}
            active={false}
            onClick={() => actions.play(projectId, levelId)}
          />
        </div>
      </Toolbar>
      {editorState.mode === EditorMode.TERRAIN && <TerrainModeSidePanel editorState={editorState} tileSet={tileSet} level={level} />}
      {editorState.mode === EditorMode.ENTITY && <EntityModeSidePanel editorState={editorState} blueprint={blueprint} />}
    </Ui>
  );
};

export default EditorUi;
