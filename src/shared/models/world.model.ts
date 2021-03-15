import { IVector2 } from "@src/shared/models/math.model";
import { TileLayer } from "@src/shared/models/tilemap.model";
import { IRGBAColorData } from "@src/shared/models/color.model";
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

export interface ILevelBlueprint {
  id: string;
  title: string;
  background: IRGBAColorData;
  gravity: number;
  defaultRoomId: string;
  rooms: IRoomBlueprint[];
  entities: IEntityBlueprint[];
  resources: {
    sprites: ISpriteData[];
    sounds: ISoundData[];
  };
}

export type IGameEvent = {
  type: string;
  data: any;
};

export interface IEventZone {
  position: IVector2;
  width: number;
  height: number;
  events: IGameEvent[];
  debug: boolean;
}

export interface IRoomBlueprint {
  id: string;
  tileSize: number;
  tileSet: string;
  tileMapRows: number;
  tileMapCols: number;
  layers: {
    [TileLayer.L0]: number[];
    [TileLayer.L1]: number[];
    [TileLayer.L2]: number[];
  };
  spawnPoints: ISpawnpoint[];
  zones: IEventZone[];
}

export interface ISpawnpoint {
  uuid?: string;
  position?: { x: number; y: number };
  direction?: { x: number; y: number };
  type: string;
  debug?: boolean;
}

export interface IPlaceData {
  layerId: number;
  tileTypeId: number;
  coords: IVector2[];
}
