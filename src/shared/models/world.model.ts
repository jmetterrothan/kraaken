import { IRGBAColorData } from "@src/shared/models/color.model";
import { ISpriteData } from "@src/shared/models/sprite.model";
import { ITileMapData } from "@src/shared/models/tilemap.model";

export interface IComponentBlueprint {
  name: string;
  metadata?: Record<string, unknown>;
}

export interface IEntityBlueprint {
  type: string;
  components: IComponentBlueprint[];
}

export interface IWorldBlueprint {
  // level data
  level: {
    background: IRGBAColorData;
    gravity: number;
    tileMap: ITileMapData;
    spawnpoints: ISpawnpoint[];
  };
  // global data
  resources: ISpriteData[];
  entities: IEntityBlueprint[];
}

export interface ISpawnpoint {
  uuid?: string;
  position: { x: number; y: number };
  direction: { x: number; y: number };
  type: string;
  debug?: boolean;
}
