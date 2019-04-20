import { IEntityData, IEntityLevelData } from '@src/shared/models/entity.model';
import { ISpriteData } from '@src/shared/models/sprite.model';

export interface IWorldData {
  level: {
    rows: number;
    cols: number;
    tileSize: number;
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
}
