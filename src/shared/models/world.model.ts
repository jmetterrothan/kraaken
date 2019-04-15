import { IEntityData } from '@src/shared/models/entity.model';
import { ISpriteData } from '@src/shared/models/sprite.model';

export interface IWorldData {
  rows: number;
  cols: number;
  sprites: ISpriteData[];
  characters: {
    [key: string]: IEntityData,
  };
}
