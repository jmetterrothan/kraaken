import React from "react";

import Ui from "@src/shared/ui";
import Toolbar from "@src/shared/ui/components/Toolbar";
import ToolbarButton from "@src/shared/ui/components/ToolbarButton";
import ToolbarTileset from "@src/shared/ui/components/ToolbarTileset";
import ToolbarSeparator from "@src/shared/ui/components/ToolbarSeparator";
import ToolbarSelect from "@src/shared/ui/components/ToolbarSelect";
import useTileset from "@src/shared/ui/components/ToolbarTileset/useTileset";
import Modal, { useModal } from "@src/shared/ui/components/Modal";

import { TileLayer } from "@src/shared/models/tilemap.model";
import { EditorMode, EditorTerrainMode, EditorCollisionMode } from "@src/shared/models/editor.model";
import { ILevelBlueprint } from "@src/shared/models/world.model";

import { driver } from "@src/shared/drivers/DriverFactory";

import dispatch, * as GameEvents from "@src/shared/events";

import UndoToolbarButton from "./UndoToolbarButton";
import RedoToolbarButton from "./RedoToolbarButton";
import ZoomToolbarSelect from "./ZoomToolbarSelect";

import editorStore from "./editorStore";

interface EditorUiProps {
  levelId: string;
  blueprint: ILevelBlueprint;
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

const ToolbarMode = ({ editorState, entities, modal, tileSet, mostFrequentlyUsedTiles }) => {
  switch (editorState.mode) {
    case EditorMode.ENTITY:
      return (
        <>
          <ToolbarSelect<string>
            icon="hat-wizard" //
            selected={editorState.entityType}
            active={false}
            onItemClick={(option) => editorStore.setSelectedEntityType(option.value)}
            options={entities}
          />
        </>
      );
    case EditorMode.COLLISION:
      return (
        <>
          <ToolbarButton
            icon="brush" //
            name="Place"
            active={editorState.collisionMode === EditorCollisionMode.PLACE}
            onClick={() => editorStore.setCollisionMode(EditorCollisionMode.PLACE)}
          />
          <ToolbarButton
            icon="eraser" //
            name="Erase"
            theme="red"
            active={editorState.collisionMode === EditorCollisionMode.ERASE}
            onClick={() => editorStore.setCollisionMode(EditorCollisionMode.ERASE)}
          />
        </>
      );
    case EditorMode.TERRAIN:
      return (
        <>
          <ToolbarButton
            icon="brush" //
            name="Place"
            active={editorState.terrainMode === EditorTerrainMode.PLACE}
            onClick={() => editorStore.setTerrainMode(EditorTerrainMode.PLACE)}
          />
          <ToolbarButton
            icon="fill" //
            name="Fill"
            active={editorState.terrainMode === EditorTerrainMode.FILL}
            onClick={() => editorStore.setTerrainMode(EditorTerrainMode.FILL)}
          />
          <ToolbarButton
            icon="eraser" //
            name="Erase"
            theme="red"
            active={editorState.terrainMode === EditorTerrainMode.ERASE}
            onClick={() => editorStore.setTerrainMode(EditorTerrainMode.ERASE)}
          />
          <ToolbarButton
            icon="eye-dropper" //
            name="Pick"
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
          <ToolbarTileset
            selected={editorState.tileTypeId} //
            onSelect={editorStore.setSelectedTileTypeId}
            src={driver.getAssetUrl(tileSet.src)}
            tileSize={tileSet.tileWidth}
            mostFrequentlyUsedTiles={mostFrequentlyUsedTiles}
            disabled={editorState.terrainMode === EditorTerrainMode.ERASE}
            onClick={modal.open}
          />
        </>
      );
    default:
      return null;
  }
};

const EditorUi: React.FC<EditorUiProps> = ({ levelId, blueprint }) => {
  const { resources, rooms, ...level } = blueprint;

  const actions = useEditorActions();

  const modal = useModal();

  const room = rooms.find((room) => room.id === level.defaultRoomId);

  const tileSet = React.useMemo(() => resources.sprites.find((sprite) => sprite.name === room.tileSet), []);

  const { tiles, nbCols, nbRows } = useTileset(driver.getAssetUrl(tileSet.src), tileSet.tileWidth);

  const mostFrequentlyUsedTiles = React.useMemo(() => {
    const tileTypeIndexes = [...room.layers[TileLayer.L1], ...room.layers[TileLayer.L2]];

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
      .filter((entity) => entity.components.find((component) => component.name === "placeable")) //
      .map((entity) => ({ name: entity.type, value: entity.type }));
  }, [blueprint]);

  const [editorState, setEditorState] = React.useState(editorStore.initialState);

  React.useLayoutEffect(() => {
    const editorSub = editorStore.subscribe(setEditorState);

    return () => {
      editorSub.unsubscribe();
    };
  }, []);

  return (
    <Ui>
      <Modal
        tiles={tiles} //
        selected={editorState.tileTypeId}
        nbCols={nbCols}
        nbRows={nbRows}
        tileWidth={tileSet.tileWidth}
        tileHeight={tileSet.tileHeight}
        isOpen={modal.isOpen}
        onClose={modal.close}
        onSelect={editorStore.setSelectedTileTypeId}
      />
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
            entities={entities}
            modal={modal}
            mostFrequentlyUsedTiles={mostFrequentlyUsedTiles}
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
