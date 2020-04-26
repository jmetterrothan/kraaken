import { ISpawnpoint } from "@src/shared/models/world.model";
import { EditorMode } from "@src/shared/models/editor.model";
import { ILayerId } from "@src/shared/models/tilemap.model";

export const PLACE_EVENT = "place_event";
export const FILL_EVENT = "fill_event";
export const SPAWN_EVENT = "spawn_event";
export const DESPAWN_EVENT = "despawn_event";

export const UNDO_EVENT = "ui_undo";
export const REDO_EVENT = "ui_redo";
export const CHANGE_MODE_EVENT = "ui_change_mode";
export const CHANGE_TILETYPE_EVENT = "ui_change_tiletype";
export const CHANGE_LAYER_EVENT = "ui_change_layer";

export type ModeChangeEvent = CustomEvent<{ mode: EditorMode }>;

export const dispatch = <T>(event: CustomEvent<T>) => {
  console.info(`Dispatched "${event.type}"`);
  window.dispatchEvent(event);
};

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

interface IVector2 {
  x: number;
  y: number;
}

interface IEventDetails {
  pushToStack?: boolean;
}

interface IPlaceEventDetails extends IEventDetails {
  coords: IVector2[];
  layer: ILayerId;
  tileType: string;
  onSuccess?: () => void;
  onFailure?: () => void;
}

export type PlaceEvent = CustomEvent<IPlaceEventDetails>;

export const placeEvent = (layer: ILayerId, tileType: string, position: IVector2[] | IVector2, pushToStack: boolean = true): PlaceEvent => {
  return new CustomEvent<IPlaceEventDetails>(PLACE_EVENT, {
    detail: {
      coords: Array.isArray(position) ? position : [position],
      layer,
      tileType,
      pushToStack,
    },
  });
};

interface ISpawnEventDetails extends IEventDetails {
  type: string;
  spawnpoint: ISpawnpoint;
  onSuccess?: () => void;
  onFailure?: () => void;
}

export type SpawnEvent = CustomEvent<ISpawnEventDetails>;

export const spawnEvent = (uuid: string, type: string, ref: string, position: IVector2, direction: IVector2 = { x: 1, y: 1 }, metadata: Record<string, unknown> = {}, pushToStack: boolean = true): SpawnEvent => {
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
      pushToStack,
    },
  });
};

interface IDespawnEventDetails {
  uuid: string;
  onSuccess?: () => void;
  onFailure?: () => void;
}

export type DespawnEvent = CustomEvent<IDespawnEventDetails>;

export const despawnEvent = (uuid: string) => {
  return new CustomEvent<IDespawnEventDetails>(DESPAWN_EVENT, {
    detail: {
      uuid,
    },
  });
};

export const undo = (): CustomEvent => {
  return new CustomEvent(UNDO_EVENT, {
    detail: {},
  });
};

export const redo = (): CustomEvent => {
  return new CustomEvent(REDO_EVENT, {
    detail: {},
  });
};
