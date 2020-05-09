import { DESPAWN_EVENT, UNDO_EVENT, REDO_EVENT, SPAWN_EVENT, PLACE_EVENT, CHANGE_TILETYPE_EVENT, CHANGE_LAYER_EVENT, CHANGE_MODE_EVENT } from "@src/shared/events/constants";

import { IEventDetails } from "@src/shared/models/event.model";
import { IVector2 } from "@src/shared/models/math.model";
import { ISpawnpoint } from "@src/shared/models/world.model";
import { EditorMode } from "@src/shared/models/editor.model";
import { ILayerId } from "@src/shared/models/tilemap.model";

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
  spawnpoint: ISpawnpoint;
  onSuccess?: () => void;
  onFailure?: () => void;
}

export type SpawnEvent = CustomEvent<ISpawnEventDetails>;

export const spawnEvent = (uuid: string, type: string, position: IVector2, direction: IVector2 = { x: 1, y: 1 }, debug = false, pushToStack: boolean = true): SpawnEvent => {
  return new CustomEvent<ISpawnEventDetails>(SPAWN_EVENT, {
    detail: {
      spawnpoint: {
        type,
        uuid,
        position,
        direction,
        debug,
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
