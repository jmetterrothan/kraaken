import { ISpawnpoint } from "@src/shared/models/world.model";
import { EditorMode } from "@src/shared/models/editor.model";
import { ILayerId } from "@src/shared/models/tilemap.model";

export const PLACE_EVENT = "place_event";
export const SPAWN_EVENT = "spawn_event";

export const CHANGE_MODE_EVENT = "ui_change_mode";
export const CHANGE_TILETYPE_EVENT = "ui_change_tiletype";
export const CHANGE_LAYER_EVENT = "ui_change_layer";

export type ModeChangeEvent = CustomEvent<{ mode: EditorMode }>;

export const modeChange = (mode: EditorMode): ModeChangeEvent => {
  return new CustomEvent(CHANGE_MODE_EVENT, {
    detail: {
      mode,
    },
  });
};

export type TileTypeChangeEvent = CustomEvent<{ id: string }>;

export const tileTypeChange = (id: string) => {
  return new CustomEvent(CHANGE_TILETYPE_EVENT, {
    detail: {
      id,
    },
  });
};

export type LayerChangeEvent = CustomEvent<{ id: ILayerId }>;

export const layerChange = (id: ILayerId) => {
  return new CustomEvent(CHANGE_LAYER_EVENT, {
    detail: {
      id,
    },
  });
};

interface IPlaceEventDetails {
  x: number;
  y: number;
  layer: ILayerId;
  tileType: string;
  onSuccess?: () => void;
  onFailure?: () => void;
}

export type PlaceEvent = CustomEvent<IPlaceEventDetails>;

export const placeEvent = (layer: ILayerId, tileType: string, x: number, y: number): PlaceEvent => {
  return new CustomEvent<IPlaceEventDetails>(PLACE_EVENT, {
    detail: {
      x,
      y,
      layer,
      tileType,
    },
  });
};

interface ISpawnEventDetails {
  type: string;
  spawnpoint: ISpawnpoint;
  onSuccess?: () => void;
  onFailure?: () => void;
}

export type SpawnEvent = CustomEvent<ISpawnEventDetails>;

export const spawnEvent = (uuid: string, type: string, ref: string, position: { x: number; y: number }, direction: { x: number; y: number } = { x: 1, y: 1 }, metadata: Record<string, unknown> = {}): SpawnEvent => {
  return new CustomEvent<ISpawnEventDetails>(SPAWN_EVENT, {
    detail: {
      type,
      spawnpoint: {
        ref,
        uuid,
        position,
        direction,
        metadata,
      },
    },
  });
};

/*
window.dispatchEvent(
  new CustomEvent("spawn_event", {
    detail: {
      type: "player",
      spawnpoint: {
        ref: "gemstone",
        position: {
          x: 460,
          y: 120,
        },
        direction: {
          x: 1,
          y: 1,
        },
        metadata: {},
      },
    },
  })
);
*/
