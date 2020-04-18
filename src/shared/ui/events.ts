import { EditorMode } from "@src/shared/models/editor.model";
import { ILayerId } from "@src/shared/models/tilemap.model";

export const PLACE_EVENT = "place_event";
export const CHANGE_MODE_EVENT = "change_mode";
export const CHANGE_TILETYPE_EVENT = "change_tiletype";
export const CHANGE_LAYER_EVENT = "change_layer";

export const modeChange = (mode: EditorMode) => {
  return new CustomEvent(CHANGE_MODE_EVENT, {
    detail: {
      mode,
    },
  });
};

export const tileTypeChange = (id: string) => {
  return new CustomEvent(CHANGE_TILETYPE_EVENT, {
    detail: {
      id,
    },
  });
};

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

export const place = (x: number, y: number, layer: ILayerId, tileType: string): PlaceEvent => {
  return new CustomEvent<IPlaceEventDetails>(PLACE_EVENT, {
    detail: {
      x,
      y,
      layer,
      tileType,
    },
  });
};
