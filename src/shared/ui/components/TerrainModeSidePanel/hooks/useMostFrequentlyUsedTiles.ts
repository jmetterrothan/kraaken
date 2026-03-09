import { ILevelBlueprint } from "@src/shared/models/world.model";
import React from "react";
import useTileset from "../../ToolbarTileset/useTileset";
import { ISpriteData } from "@src/shared/models/sprite.model";
import { registerEvent } from "@src/shared/utility/Utility";

import * as GameEventTypes from "@src/shared/events/constants";
import * as GameEvents from "@src/shared/events";

const mostFrequentlyUsedTiles = (level: ILevelBlueprint | null) => {
  const tileTypeIndexes = (level?.layers ?? []).map((layer) => layer.data).flat();

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

const useMostFrequentlyUsedTiles = (level: ILevelBlueprint | null, tileSet: ISpriteData) => {
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

  return {
    tiles,
    list,
    lastUsed,
  } as const;
};

export default useMostFrequentlyUsedTiles;
