import { BehaviorSubject } from "rxjs";

import { EditorMode, EditorTerrainMode } from "@src/shared/models/editor.model";

import dispatch, * as GameEvents from "@src/shared/events";

export interface IEditorStoreState {
  loading: boolean;
  scale: number;
  mode: EditorMode;
  terrainMode: EditorTerrainMode;
  layerId: number;
  tileSelection: Record<string, { tileTypeId: number }>;
  entityType: string | null;
}

const initialState: IEditorStoreState = {
  loading: false,
  scale: 5,
  mode: EditorMode.TERRAIN,
  terrainMode: EditorTerrainMode.PLACE,
  layerId: 0,
  tileSelection: {},
  entityType: null,
};

const editorStore = (() => {
  const subject = new BehaviorSubject<IEditorStoreState>(initialState);

  const subscribe = (listener: () => void) => {
    const subscription = subject.subscribe(listener);
    return () => subscription.unsubscribe();
  };

  // This function will get called at any time within the render cycle.
  // But it mostly gets executed after the data update is notified through subscribe
  // IMPORTANT: do not return a new object, else React will go into infinite render
  const getSnapshot = () => {
    return subject.value;
  };

  const setLoading = (b: boolean): void => {
    const state = getSnapshot();

    if (b !== state.loading) {
      subject.next({
        ...state,
        loading: b,
      });
    }
  };

  const setMode = (mode: IEditorStoreState["mode"]): void => {
    const state = getSnapshot();

    if (mode !== state.mode) {
      subject.next({
        ...state,
        mode,
      });
    }
  };

  const setTerrainMode = (terrainMode: IEditorStoreState["terrainMode"]): void => {
    const state = getSnapshot();

    if (terrainMode !== state.terrainMode) {
      subject.next({
        ...state,
        terrainMode,
      });
    }
  };

  const setSelectedLayerId = (layerId: number): void => {
    const state = getSnapshot();

    if (layerId !== state.layerId) {
      subject.next({
        ...state,
        layerId,
      });
    }
  };

  const setSelectedTileTypeId = (tileSet: string, tileTypeId: number): void => {
    const state = getSnapshot();
    const prevValue = state.tileSelection[tileSet];

    if (!prevValue || tileTypeId !== prevValue.tileTypeId) {
      subject.next({
        ...state,
        tileSelection: {
          ...state.tileSelection,
          [tileSet]: { ...prevValue, tileTypeId },
        },
      });
    }
  };

  const setSelectedEntityType = (entityType: IEditorStoreState["entityType"]): void => {
    const state = getSnapshot();

    if (entityType !== state.entityType) {
      subject.next({
        ...state,
        entityType,
      });
    }
  };

  const setScale = (scale: IEditorStoreState["scale"]): void => {
    const state = getSnapshot();

    if (scale !== state.scale) {
      subject.next({
        ...state,
        scale,
      });
    }

    dispatch(GameEvents.zoomEvent(scale));
  };

  return {
    getSnapshot,
    subscribe,
    setLoading,
    setMode,
    setTerrainMode,
    setSelectedLayerId,
    setSelectedTileTypeId,
    setSelectedEntityType,
    setScale,
  };
})();

export default editorStore;
