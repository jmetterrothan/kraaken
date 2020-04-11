import { IRGBAColorData } from "@src/shared/models/color.model";
import { IObject } from "@src/shared/models/entity.model";
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
    spawnpoints: {
      player: ISpawnpoint;
      loots: ISpawnpoint[];
      entities: ISpawnpoint[];
    };
  };
  // global data
  resources: ISpriteData[];
  objects: IObject[];
}

export interface ISpawnpoint {
  ref: string;
  spawn: IVector2;
  direction: IVector2;
  metadata: {
    debug?: boolean;
  };
}
