import { IEntityData, ILootData, IObjectLevelData, IPlayerData } from '@src/shared/models/entity.model';
import { ISpriteData } from '@src/shared/models/sprite.model';
import { ITileMapData } from '@src/shared/models/tilemap.model';
import { IVector2Data } from './math.model';

export interface IWorldData {
  // level data
  level: {
    physics: {
      gravity: IVector2Data;
    };
    tileMap: ITileMapData;
    player: IObjectLevelData;
    loots: IObjectLevelData[];
    entities: IObjectLevelData[];
  };

  // global data
  sprites: ISpriteData[];
  sfx: {
    [key: string]: IEntityData,
  };
  entities: {
    [key: string]: IEntityData | IPlayerData,
  };
  loots: {
    [key: string]: ILootData;
  };
}
