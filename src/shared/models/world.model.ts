import { vec4 } from "gl-matrix";

import { IVector2 } from "@src/shared/models/math.model";
import { TileLayer } from "@src/shared/models/tilemap.model";
import { ISpriteData } from "@src/shared/models/sprite.model";
import { ISoundData } from "@src/shared/models/sound.model";

export interface IComponentBlueprint {
  name: string;
  metadata?: Record<string, unknown>;
}

export interface IEntityBlueprint {
  type: string;
  components: IComponentBlueprint[];
}

export interface IProjectBlueprint {
  id: string;
  version: number;
  title: string;
  defaultLevelId: string;
  levels: ILevelBlueprint[];
  entities: IEntityBlueprint[];
  assets: {
    sprites: ISpriteData[];
    sounds: ISoundData[];
  };
}

export type IGameEvent = {
  type: string;
  data: any;
};

export interface IEventZone {
  mode: "contains" | "intersects";
  position: IVector2;
  width: number;
  height: number;
  color: vec4;
  cooldownDelay: number;
  maxTimesTriggered: number;
  shouldTriggerWhileActive: boolean;
  events: IGameEvent[];
}

export interface ILayer {
  tileSet: string;
  visible: boolean;
  data: number[];
}

export interface ILevelBlueprint {
  id: string;
  tileSize: number;
  tileMapRows: number;
  tileMapCols: number;
  background: vec4;
  gravity: number;
  layers: {
    [TileLayer.L0]: ILayer;
    [TileLayer.L1]: ILayer;
    [TileLayer.L2]: ILayer;
  };
  spawnPoints: ISpawnpoint[];
  zones: IEventZone[];
}

export interface ISpawnpoint {
  type: string;
  uuid: string;
  components?: {
    position?: { x?: number; y?: number };
    rigid_body?: { direction?: { x?: number; y?: number } };
    bounding_box?: { debug?: boolean; width?: number; height?: number; color?: string };
    event_zone?: { mode?: "contains" | "intersects"; cooldownDelay?: number; maxTimesTriggered?: number; shouldTriggerWhileActive?: boolean; events?: any[]; applyToEntityTypes?: string[] };
  };
}

export type IPlaceTileData = IVector2 & { tileTypeId: number };

export interface IPlaceData {
  layerId: number;
  coords: IPlaceTileData[];
}

export type IWorldOptions = {
  // ...
};
