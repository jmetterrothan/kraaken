import { memo, useMemo } from "react";
import cx from "classnames";

import TileImage from "../TileImage";

import "./TerrainModeSidePanel.scss";
import { ILevelBlueprint } from "@src/shared/models/world.model";

import { ISpriteData } from "@src/shared/models/sprite.model";
import SidePanel from "../SidePanel";
import type { IEditorStoreState } from "@src/states/EditorState/editorStore";
import editorStore from "@src/states/EditorState/editorStore";
import useMostFrequentlyUsedTiles from "./hooks/useMostFrequentlyUsedTiles";
import Panel from "../Panel";
import ListView from "../ListView";

type TerrainModeSidePanelProps = {
  projectId: string;
  levelId: string;
  editorState: IEditorStoreState;
  tileSet: ISpriteData;
  level?: ILevelBlueprint;
};

const TerrainModeSidePanel = ({ editorState, tileSet, level }: TerrainModeSidePanelProps) => {
  const tileTypeId = editorState.tileSelection[tileSet.name]?.tileTypeId ?? 0;

  const { tiles, list, lastUsed } = useMostFrequentlyUsedTiles(level ?? null, tileSet);

  const layers = useMemo(() => {
    return (level?.layers ?? []).filter((layer) => layer.type !== "collision").sort((a, b) => a.zIndex - b.zIndex);
  }, [level]);

  return (
    <SidePanel className="terrain-mode-side-panel">
      <Panel>
        <Panel.Header>
          <Panel.Title icon="layer-group">Layers</Panel.Title>
        </Panel.Header>
        <Panel.Body>
          <ListView>
            {layers.map((layer) => {
              return (
                <ListView.Item key={layer.id}>
                  <div
                    className={cx("layer", editorState.layerId === layer.id && "layer--selected")}
                    onClick={() => {
                      editorStore.setSelectedLayerId(layer.id);
                    }}
                  >
                    <div>
                      <i className={cx("far", "fa-lg", `fa-th-large`)} style={{ marginRight: "8px" }} />
                      {layer.type}
                    </div>
                    <button type="button" className="layer__visibility-toggle" disabled>
                      <i className={cx("fas", "fa-sm", `fa-${layer.visible ? "eye" : "eye-slash"}`)} />
                    </button>
                  </div>
                </ListView.Item>
              );
            })}
          </ListView>
        </Panel.Body>
      </Panel>
      {list.length > 0 && (
        <Panel className="tileset-group">
          <Panel.Header>
            <Panel.Title>Most frequently used</Panel.Title>
          </Panel.Header>
          <Panel.Body>
            <ul className="tileset-group__list">
              {list.map(({ index, row, col, subImage }) => (
                <li key={index} className={cx(index === tileTypeId && "active")}>
                  <TileImage
                    title={`row: ${row}, col: ${col}, index: ${index}`}
                    src={subImage}
                    onClick={() => {
                      editorStore.setSelectedTileTypeId(tileSet.name, index);
                    }}
                  />
                </li>
              ))}
            </ul>
          </Panel.Body>
        </Panel>
      )}
      {lastUsed.length > 0 && (
        <Panel className="tileset-group">
          <Panel.Header>
            <Panel.Title>Last used</Panel.Title>
          </Panel.Header>
          <Panel.Body>
            <ul className="tileset-group__list">
              {lastUsed
                .map((id) => tiles[id])
                .filter((tile) => typeof tile !== "undefined")
                .map(({ index, row, col, subImage }) => (
                  <li key={index} className={cx(index === tileTypeId && "active")}>
                    <TileImage
                      title={`row: ${row}, col: ${col}, index: ${index}`}
                      src={subImage}
                      onClick={() => {
                        editorStore.setSelectedTileTypeId(tileSet.name, index);
                      }}
                    />
                  </li>
                ))}
            </ul>
          </Panel.Body>
        </Panel>
      )}
    </SidePanel>
  );
};

export default memo(TerrainModeSidePanel);
