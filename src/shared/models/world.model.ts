import { TileLayer } from './tilemap.model';
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
  title: string;
  background: IRGBAColorData;
  gravity: number;
  spawnPoints: ISpawnpoint[];
  defaultTileType: number;
  tileSize: number;
  tileSet: string;
  tileMapRows: number;
  tileMapCols: number;
  layers: {
    [TileLayer.L0]: number[],
    [TileLayer.L1]: number[],
    [TileLayer.L2]: number[],
  }
}

export interface IWorldBlueprint {
  level: ILevelBlueprint;
  sprites: ISpriteData[];
  sounds: ISoundData[];
  entities: IEntityBlueprint[];
}

export interface ISpawnpoint {
  uuid?: string;
  position?: { x: number; y: number };
  direction?: { x: number; y: number };
  type: string;
  debug?: boolean;
}
