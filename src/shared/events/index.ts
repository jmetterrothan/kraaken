import * as GameEventTypes from "@src/shared/events/constants";

import { TileLayer } from "@src/shared/models/tilemap.model";
import { IEventDetails } from "@src/shared/models/event.model";
import { IVector2 } from "@src/shared/models/math.model";
import { IPlaceTileData, ISpawnpoint } from "@src/shared/models/world.model";

interface IChangeLevelEventDetails {
  levelId: string;
  moveTo?: IVector2;
  lookAt?: IVector2;
}

export type ChangeLevelEvent = CustomEvent<IChangeLevelEventDetails>;

export const changeLevel = (levelId: string, moveTo?: IVector2, lookAt?: IVector2): ChangeLevelEvent => {
  return new CustomEvent<IChangeLevelEventDetails>(GameEventTypes.CHANGE_LEVEL, {
    detail: {
      levelId,
      moveTo,
      lookAt,
    },
  });
};

interface IPlaceEventDetails extends IEventDetails {
  coords: IPlaceTileData[];
  layer: TileLayer;
  onSuccess?: () => void;
  onFailure?: () => void;
}

export type PlaceEvent = CustomEvent<IPlaceEventDetails>;

export const placeEvent = (layer: TileLayer, coords: IPlaceTileData[], pushToStack = true): PlaceEvent => {
  return new CustomEvent<IPlaceEventDetails>(GameEventTypes.PLACE_EVENT, {
    detail: {
      coords,
      layer,
      pushToStack,
    },
  });
};

interface ILevelStateSwitchEventDetails {
  projectId: string;
  levelId: string | null;
}

export type LevelStateSwitchEvent = CustomEvent<ILevelStateSwitchEventDetails>;

export const playEvent = (projectId: string, levelId: string | null): LevelStateSwitchEvent => {
  return new CustomEvent<ILevelStateSwitchEventDetails>(GameEventTypes.LEVEL_STATE_SWITCH_EVENT, {
    detail: {
      projectId,
      levelId,
    },
  });
};

interface IEditorStateSwitchEventDetails {
  projectId: string;
  levelId: string | null;
}

export type EditorStateSwitchEvent = CustomEvent<IEditorStateSwitchEventDetails>;

export const editEvent = (projectId: string, levelId: string | null): EditorStateSwitchEvent => {
  return new CustomEvent<IEditorStateSwitchEventDetails>(GameEventTypes.EDITOR_STATE_SWITCH_EVENT, {
    detail: {
      projectId,
      levelId,
    },
  });
};

interface ISaveEventDetails {
  id: string;
}

export type SaveEvent = CustomEvent<ISaveEventDetails>;

export const saveEvent = (id: string): SaveEvent => {
  return new CustomEvent<ISaveEventDetails>(GameEventTypes.SAVE_EVENT, {
    detail: {
      id,
    },
  });
};

interface ISpawnEventDetails extends IEventDetails {
  spawnpoint: ISpawnpoint;
  onSuccess?: () => void;
  onFailure?: () => void;
}

export type SpawnEvent = CustomEvent<ISpawnEventDetails>;

export const spawnEvent = (uuid: string, type: string, position: IVector2, direction: IVector2 = { x: 1, y: 1 }, pushToStack = true): SpawnEvent => {
  return new CustomEvent<ISpawnEventDetails>(GameEventTypes.SPAWN_EVENT, {
    detail: {
      spawnpoint: {
        type,
        uuid,
        components: { position, direction },
      },
      pushToStack,
    },
  });
};

interface IDespawnEventDetails {
  uuid: string;
  pushToStack?: boolean;
  onSuccess?: () => void;
  onFailure?: () => void;
}

export type DespawnEvent = CustomEvent<IDespawnEventDetails>;

export const despawnEvent = (uuid: string, pushToStack = true): DespawnEvent => {
  return new CustomEvent<IDespawnEventDetails>(GameEventTypes.DESPAWN_EVENT, {
    detail: {
      uuid,
      pushToStack,
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
  });
};

export const zoomInEvent = (): ZoomEvent => {
  return new CustomEvent(GameEventTypes.ZOOM_IN_EVENT, {});
};

export const zoomOutEvent = (): ZoomEvent => {
  return new CustomEvent(GameEventTypes.ZOOM_OUT_EVENT, {});
};

interface IUserJoinedLevelEventDetails {
  uuid: string;
}

export type UserJoinedLevelEvent = CustomEvent<IUserJoinedLevelEventDetails>;

export const userJoinedLevelEvent = (uuid: string): UserJoinedLevelEvent => {
  return new CustomEvent<IUserJoinedLevelEventDetails>(GameEventTypes.USER_JOINED_LEVEL_EVENT, {
    detail: {
      uuid,
    },
  });
};

interface IUserLeftLevelEventDetails {
  uuid: string;
}

export type UserLeftLevelEvent = CustomEvent<IUserLeftLevelEventDetails>;

export const userLeftLevelEvent = (uuid: string): UserLeftLevelEvent => {
  return new CustomEvent<IUserLeftLevelEventDetails>(GameEventTypes.USER_JOINED_LEVEL_EVENT, {
    detail: {
      uuid,
    },
  });
};

const dispatch = <T>(event: CustomEvent<T>): void => {
  console.info(`Dispatched "${event.type}"`, event.detail);
  window.dispatchEvent(event);
};

export default dispatch;
