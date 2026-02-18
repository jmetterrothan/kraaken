import React, { memo } from "react";
import cx from "classnames";

import * as GameEventTypes from "@src/shared/events/constants";
import * as GameEvents from "@src/shared/events";

import useTileset from "../ToolbarTileset/useTileset";
import TileImage from "../TileImage";
import { registerEvent } from "@src/shared/utility/Utility";

import "./TerrainModeSidePanel.scss";
import { ILevelBlueprint } from "@src/shared/models/world.model";
import { TileLayer } from "@src/shared/models/tilemap.model";
import { ISpriteData } from "@src/shared/models/sprite.model";
import SidePanel from "../SidePanel";
import type { IEditorStoreState } from "@src/states/EditorState/editorStore";
import editorStore from "@src/states/EditorState/editorStore";

type TerrainModeSidePanelProps = {
  editorState: IEditorStoreState;
  tileSet: ISpriteData;
  level?: ILevelBlueprint;
};

const mostFrequentlyUsedTiles = (level?: ILevelBlueprint) => {
  const tileTypeIndexes = [...(level?.layers[TileLayer.L1].data ?? []), ...(level?.layers[TileLayer.L2].data ?? [])];

  return tileTypeIndexes.reduce<Record<number, number>>((acc, index) => {
    if (index !== 0) {
      if (typeof acc[index] === "undefined") {
        acc[index] = 0;
      }
      acc[index]++;
    }
    return acc;
  }, {});
};

const TerrainModeSidePanel = ({ editorState, tileSet, level }: TerrainModeSidePanelProps) => {
  const [lastUsed, setLastUsed] = React.useState<number[]>([]);
  const [history, setHistory] = React.useState<Record<number, number>>(mostFrequentlyUsedTiles(level));

  const { tiles } = useTileset(tileSet);

  const list = React.useMemo(() => {
    if (tiles.length > 0) {
      return Object.entries(history)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 32)
        .map(([k]) => {
          return tiles[Number.parseInt(k, 10)];
        })
        .filter((tile) => typeof tile !== "undefined");
    }
    return [];
  }, [history, tiles]);

  React.useEffect(() => {
    const unsubscribe = registerEvent(GameEventTypes.PLACE_EVENT, (e: GameEvents.PlaceEvent) => {
      const { coords, pushToStack } = e.detail || {};

      if (!pushToStack) {
        // ignore if the user is not at the origin of the placement
        return;
      }

      const tileTypeIds = Array.from(new Set(coords.map((c) => c.tileTypeId)));

      setHistory((temp) =>
        tileTypeIds.reduce((acc, tileTypeId) => {
          return {
            ...acc,
            [tileTypeId]: (acc[tileTypeId] ?? 0) + coords.reduce((acc, c) => acc + (c.tileTypeId === tileTypeId ? 1 : 0), 0),
          };
        }, temp)
      );

      // update last used
      setLastUsed((old) => {
        const temp = [...old];

        tileTypeIds.forEach((tileTypeId) => {
          const i = temp.findIndex((id) => id === tileTypeId);

          if (i === -1) {
            if (temp.length >= 8) {
              temp.pop();
            }
          } else {
            temp.splice(i, 1);
          }

          temp.unshift(tileTypeId);
        });

        return temp;
      });
    });

    return unsubscribe;
  }, []);

  return (
    <SidePanel className="terrain-mode-side-panel">
      {tiles.length > 0 && (
        <div className="tileset-group">
          <SidePanel.Title>Most frequently used</SidePanel.Title>
          <ul className="tileset-group__list">
            {list.map(({ index, row, col, subImage }) => (
              <li key={index} className={cx(index === editorState.tileTypeId && "active")}>
                <TileImage
                  title={`row: ${row}, col: ${col}, index: ${index}`}
                  src={subImage}
                  onClick={() => {
                    editorStore.setSelectedTileTypeId(index);
                  }}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
      {lastUsed.length > 0 && (
        <div className="tileset-group">
          <SidePanel.Title>Last used</SidePanel.Title>
          <ul className="tileset-group__list">
            {lastUsed
              .map((id) => tiles[id])
              .filter((tile) => typeof tile !== "undefined")
              .map(({ index, row, col, subImage }) => (
                <li key={index} className={cx(index === editorState.tileTypeId && "active")}>
                  <TileImage
                    title={`row: ${row}, col: ${col}, index: ${index}`}
                    src={subImage}
                    onClick={() => {
                      editorStore.setSelectedTileTypeId(index);
                    }}
                  />
                </li>
              ))}
          </ul>
        </div>
      )}
    </SidePanel>
  );
};

export default memo(TerrainModeSidePanel);
