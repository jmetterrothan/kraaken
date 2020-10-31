import { IRGBAColorData } from "@src/shared/models/color.model";
import { ISpriteData } from "@src/shared/models/sprite.model";
import { ISoundData } from "@src/shared/models/sound.model";
import { ITileGroups, ITileTypeData } from "@src/shared/models/tilemap.model";

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
  tileGroups: ITileGroups;
  tileTypes: ITileTypeData[];
  tileMapRows: number;
  tileMapCols: number;
  tileMapLayer1: number[];
  tileMapLayer2: number[];
  tileMapLayer3: number[];
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
