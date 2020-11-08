import * as GameEventTypes from "@src/shared/events/constants";

import { TileLayer } from '@shared/models/tilemap.model';
import { IEventDetails } from "@shared/models/event.model";
import { IVector2 } from "@shared/models/math.model";
import { ISpawnpoint } from "@shared/models/world.model";
import { EditorMode } from "@shared/models/editor.model";

export type ModeChangeEvent = CustomEvent<{ mode: EditorMode }>;


export const modeChangeEvent = (mode: EditorMode): ModeChangeEvent => {
  return new CustomEvent(GameEventTypes.CHANGE_MODE_EVENT, {
    detail: {
      mode,
    },
  });
};

export type TileTypeChangeEvent = CustomEvent<{ id: number }>;

export const tileTypeChangeEvent = (id: number): TileTypeChangeEvent => {
  return new CustomEvent(GameEventTypes.CHANGE_TILETYPE_EVENT, {
    detail: {
      id,
    },
  });
};

export type LayerChangeEvent = CustomEvent<{ id: TileLayer }>;

export const layerChangeEvent = (id: TileLayer): LayerChangeEvent => {
  return new CustomEvent(GameEventTypes.CHANGE_LAYER_EVENT, {
    detail: {
      id,
    },
  });
};

interface IPlaceEventDetails extends IEventDetails {
  coords: IVector2[];
  layer: TileLayer;
  tileTypeId: number;
  onSuccess?: () => void;
  onFailure?: () => void;
}

export type PlaceEvent = CustomEvent<IPlaceEventDetails>;

export const placeEvent = (layer: TileLayer, tileTypeId: number, position: IVector2[] | IVector2, pushToStack = true): PlaceEvent => {
  return new CustomEvent<IPlaceEventDetails>(GameEventTypes.PLACE_EVENT, {
    detail: {
      coords: Array.isArray(position) ? position : [position],
      layer,
      tileTypeId,
      pushToStack,
    },
  });
};

interface ILevelStateSwitchEventDetails {
  id: string;
}

export type LevelStateSwitchEvent = CustomEvent<ILevelStateSwitchEventDetails>;

export const playEvent = (id: string): LevelStateSwitchEvent  => {
  return new CustomEvent<ILevelStateSwitchEventDetails>(GameEventTypes.LEVEL_STATE_SWITCH_EVENT, {
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
  return new CustomEvent<IEditorStateSwitchEventDetails>(GameEventTypes.EDITOR_STATE_SWITCH_EVENT, {
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
  return new CustomEvent<ISaveEventDetails>(GameEventTypes.SAVE_EVENT, {
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
  return new CustomEvent<ISpawnEventDetails>(GameEventTypes.SPAWN_EVENT, {
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
  return new CustomEvent<IDespawnEventDetails>(GameEventTypes.DESPAWN_EVENT, {
    detail: {
      uuid,
    },
  });
};

export const undoEvent = (): CustomEvent => {
  return new CustomEvent(GameEventTypes.UNDO_EVENT, {
    detail: {},
  });
};

export const redoEvent = (): CustomEvent => {
  return new CustomEvent(GameEventTypes.REDO_EVENT, {
    detail: {},
  });
};

interface IZoomEventDetails {
  scale: number;
}

export type ZoomEvent = CustomEvent<IZoomEventDetails>;

export const zoomEvent = (scale: number): ZoomEvent => {
  return new CustomEvent<IZoomEventDetails>(GameEventTypes.ZOOM_EVENT, {
    detail: {
      scale,
    },
  })
}

const dispatch = <T>(event: CustomEvent<T>): void => {
  console.info(`Dispatched "${event.type}"`);
  window.dispatchEvent(event);
};

export default dispatch;
