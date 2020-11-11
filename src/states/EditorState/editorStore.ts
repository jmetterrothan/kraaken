import { Subject, Subscription } from 'rxjs';

import { TileLayer } from '@shared/models/tilemap.model';
import { EditorMode, EditorTerrainMode } from '@shared/models/editor.model';

import dispatch, * as GameEvents from '@shared/events';

export interface IEditorStoreState {
  scale: number;
  mode: EditorMode;
  terrainMode: EditorTerrainMode;
  layerId: number;
  tileTypeId: number;
  entityType: string;
}

const subject = new Subject();

const initialState: IEditorStoreState = {
  scale: 5,
  mode: EditorMode.TERRAIN,
  terrainMode: EditorTerrainMode.PLACE,
  layerId: TileLayer.L1,
  tileTypeId: 502,
  entityType: "alien_bat",
};

let state;

const editorStore = {
  initialState,
  init: (): void => {
    state = initialState;
    subject.next(state);
  },
  subscribe: (setState: (state: IEditorStoreState) => void): Subscription => {
    return subject.subscribe(setState);
  },
  setMode: (mode: IEditorStoreState['mode']) : void=> {
    state = {
      ...state,
      mode,
    };
    subject.next(state);
  },
  setTerrainMode: (terrainMode: IEditorStoreState['terrainMode']): void => {
    state = {
      ...state,
      terrainMode,
    };
    subject.next(state);
  },
  setSelectedLayerId: (layerId: IEditorStoreState['layerId']): void => {
    state = {
      ...state,
      layerId,
    };
    subject.next(state);
  },
  setSelectedTileTypeId: (tileTypeId: IEditorStoreState['tileTypeId']): void => {
    state = {
      ...state,
      tileTypeId,
    };
    subject.next(state);
  },
  setSelectedEntityType: (entityType: IEditorStoreState['entityType']): void => {
    state = {
      ...state,
      entityType,
    };
    subject.next(state);
  },
  setScale: (scale: IEditorStoreState['scale']): void => {
    state = {
      ...state,
      scale,
    };
    
    dispatch(GameEvents.zoomEvent(scale));
    subject.next(state);
  },
};

export default editorStore;
