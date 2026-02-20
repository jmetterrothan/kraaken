import { Subject, Subscription } from "rxjs";

import { TileLayer } from "@src/shared/models/tilemap.model";
import { EditorMode, EditorTerrainMode } from "@src/shared/models/editor.model";

import dispatch, * as GameEvents from "@src/shared/events";

export interface IEditorStoreState {
  loading: boolean;
  scale: number;
  mode: EditorMode;
  terrainMode: EditorTerrainMode;
  layerId: TileLayer;
  layers: Record<TileLayer, { tileTypeId: number }>;
  entityType: string | null;
}

const subject = new Subject<IEditorStoreState>();

const initialState: IEditorStoreState = {
  loading: false,
  scale: 5,
  mode: EditorMode.TERRAIN,
  terrainMode: EditorTerrainMode.PLACE,
  layerId: TileLayer.L1,
  layers: {
    [TileLayer.L0]: { tileTypeId: 0 },
    [TileLayer.L1]: { tileTypeId: 0 },
    [TileLayer.L2]: { tileTypeId: 0 },
  },
  entityType: null,
};

let state: IEditorStoreState = initialState;

const editorStore = {
  initialState,
  init: (): void => {
    state = initialState;
    subject.next(state);
  },
  subscribe: (setState: (state: IEditorStoreState) => void): Subscription => {
    return subject.subscribe(setState);
  },
  setLoading: (b: boolean): void => {
    if (b !== state.loading) {
      state = {
        ...state,
        loading: b,
      };

      subject.next(state);
    }
  },
  setMode: (mode: IEditorStoreState["mode"]): void => {
    if (mode !== state.mode) {
      state = {
        ...state,
        mode,
      };

      subject.next(state);
    }
  },
  setTerrainMode: (terrainMode: IEditorStoreState["terrainMode"]): void => {
    if (terrainMode !== state.terrainMode) {
      state = {
        ...state,
        terrainMode,
      };

      subject.next(state);
    }
  },
  setSelectedLayerId: (layerId: TileLayer): void => {
    if (layerId !== state.layerId) {
      state = {
        ...state,
        layerId,
      };

      subject.next(state);
    }
  },
  setSelectedTileTypeId: (tileTypeId: number): void => {
    const prevValue = state.layers[state.layerId];

    if (prevValue && tileTypeId !== prevValue.tileTypeId) {
      state = {
        ...state,
        layers: {
          ...state.layers,
          [state.layerId]: { ...prevValue, tileTypeId },
        },
      };

      subject.next(state);
    }
  },
  setSelectedEntityType: (entityType: IEditorStoreState["entityType"]): void => {
    if (entityType !== state.entityType) {
      state = {
        ...state,
        entityType,
      };

      subject.next(state);
    }
  },
  setScale: (scale: IEditorStoreState["scale"]): void => {
    if (scale !== state.scale) {
      state = {
        ...state,
        scale,
      };

      subject.next(state);
    }
    dispatch(GameEvents.zoomEvent(scale));
  },
};

export default editorStore;
