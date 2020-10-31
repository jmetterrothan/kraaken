import { EDITOR_STATE_SWITCH_EVENT } from './constants';
import { SAVE_EVENT, DESPAWN_EVENT, UNDO_EVENT, REDO_EVENT, SPAWN_EVENT, PLACE_EVENT, CHANGE_TILETYPE_EVENT, CHANGE_LAYER_EVENT, CHANGE_MODE_EVENT, LEVEL_STATE_SWITCH_EVENT } from "@src/shared/events/constants";

import { IEventDetails } from "@src/shared/models/event.model";
import { IVector2 } from "@src/shared/models/math.model";
import { ISpawnpoint } from "@src/shared/models/world.model";
import { EditorMode } from "@src/shared/models/editor.model";
import { ILayerId } from "@src/shared/models/tilemap.model";

export type ModeChangeEvent = CustomEvent<{ mode: EditorMode }>;

export const dispatch = <T>(event: CustomEvent<T>): void => {
  console.info(`Dispatched "${event.type}"`);
  window.dispatchEvent(event);
};

export const modeChangeEvent = (mode: EditorMode): ModeChangeEvent => {
  return new CustomEvent(CHANGE_MODE_EVENT, {
    detail: {
      mode,
    },
  });
};

export type TileTypeChangeEvent = CustomEvent<{ index: number }>;

export const tileTypeChangeEvent = (index: number): TileTypeChangeEvent => {
  return new CustomEvent(CHANGE_TILETYPE_EVENT, {
    detail: {
      index,
    },
  });
};

export type LayerChangeEvent = CustomEvent<{ id: ILayerId }>;

export const layerChangeEvent = (id: ILayerId): LayerChangeEvent => {
  return new CustomEvent(CHANGE_LAYER_EVENT, {
    detail: {
      id,
    },
  });
};

interface IPlaceEventDetails extends IEventDetails {
  coords: IVector2[];
  layer: ILayerId;
  tileTypeIndex: number;
  onSuccess?: () => void;
  onFailure?: () => void;
}

export type PlaceEvent = CustomEvent<IPlaceEventDetails>;

export const placeEvent = (layer: ILayerId, tileTypeIndex: number, position: IVector2[] | IVector2, pushToStack = true): PlaceEvent => {
  return new CustomEvent<IPlaceEventDetails>(PLACE_EVENT, {
    detail: {
      coords: Array.isArray(position) ? position : [position],
      layer,
      tileTypeIndex,
      pushToStack,
    },
  });
};

interface ILevelStateSwitchEventDetails {
  id: string;
}

export type LevelStateSwitchEvent = CustomEvent<ILevelStateSwitchEventDetails>;

export const playEvent = (id: string): LevelStateSwitchEvent  => {
  return new CustomEvent<ILevelStateSwitchEventDetails>(LEVEL_STATE_SWITCH_EVENT, {
    detail: {
      id,
    }
  })
}


interface IEditorStateSwitchEventDetails {
  id: string;
}

export type EditorStateSwitchEvent = CustomEvent<IEditorStateSwitchEventDetails>;

export const editEvent = (id: string): EditorStateSwitchEvent  => {
  return new CustomEvent<IEditorStateSwitchEventDetails>(EDITOR_STATE_SWITCH_EVENT, {
    detail: {
      id,
    }
  })
}

interface ISaveEventDetails {
  id: string;
}

export type SaveEvent = CustomEvent<ISaveEventDetails>;

export const saveEvent = (id: string): SaveEvent  => {
  return new CustomEvent<ISaveEventDetails>(SAVE_EVENT, {
    detail: {
      id,
    }
  })
}


interface ISpawnEventDetails extends IEventDetails {
  spawnpoint: ISpawnpoint;
  onSuccess?: () => void;
  onFailure?: () => void;
}

export type SpawnEvent = CustomEvent<ISpawnEventDetails>;

export const spawnEvent = (uuid: string, type: string, position: IVector2, direction: IVector2 = { x: 1, y: 1 }, debug = false, pushToStack = true): SpawnEvent => {
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

export const despawnEvent = (uuid: string): DespawnEvent => {
  return new CustomEvent<IDespawnEventDetails>(DESPAWN_EVENT, {
    detail: {
      uuid,
    },
  });
};

export const undoEvent = (): CustomEvent => {
  return new CustomEvent(UNDO_EVENT, {
    detail: {},
  });
};

export const redoEvent = (): CustomEvent => {
  return new CustomEvent(REDO_EVENT, {
    detail: {},
  });
};
