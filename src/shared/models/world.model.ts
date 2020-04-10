import { IRGBAColorData } from "@src/shared/models/color.model";
import { IEntity, ILoot, IPlayer } from "@src/shared/models/entity.model";
import { ISpriteData } from "@src/shared/models/sprite.model";
import { ITileMapData } from "@src/shared/models/tilemap.model";
import { IVector2 } from "./math.model";

export interface IWorldData {
  // level data
  level: {
    background: IRGBAColorData;
    physics: {
      gravity: IVector2;
    };
    tileMap: ITileMapData;
    player: ISpawnpoint;
    loots: ISpawnpoint[];
    entities: ISpawnpoint[];
  };

  // global data
  sprites: ISpriteData[];
  sfx: {
    [key: string]: IEntity;
  };
  entities: {
    [key: string]: IEntity | IPlayer;
  };
  loots: {
    [key: string]: ILoot;
  };
}

export interface ISpawnpoint {
  ref: string;
  spawn: IVector2;
  direction: IVector2;
  metadata: {
    debug?: boolean;
  };
}
