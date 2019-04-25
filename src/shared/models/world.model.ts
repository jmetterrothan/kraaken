import { IEntityData, IEntityLevelData } from '@src/shared/models/entity.model';
import { ISpriteData } from '@src/shared/models/sprite.model';
import { ITileMapData } from '@src/shared/models/tilemap.model';

export interface IWorldData {
  level: {
    tileMap: ITileMapData;
    player: IEntityLevelData;
    entities: IEntityLevelData[];
  };
  sprites: ISpriteData[];
  sfx: {
    [key: string]: IEntityData,
  };
  entities: {
    [key: string]: IEntityData,
  };
  loot: {
    [key: string]: {
      metadata: any,
      entity: string;
    };
  };
}
