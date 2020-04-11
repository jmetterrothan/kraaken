import SFX from "@src/objects/sfx/SFX";

import { IEntity, ISfx, ILoot } from "@src/shared/models/entity.model";
import { IWorldData } from "@src/shared/models/world.model";

class Level {
  public readonly id: number;

  private data: IWorldData;

  public constructor(id: number, data: IWorldData) {
    this.id = id;
    this.data = data;

    SFX.DATA = this.sfx;
  }

  public get sprites() {
    return this.data.resources;
  }

  public get loots(): Record<string, ILoot> {
    return this.data.objects
      .filter((object) => object.type === "loot")
      .reduce((acc, val) => {
        acc[val.id] = val;
        return acc;
      }, {});
  }

  public get entities(): Record<string, IEntity> {
    return this.data.objects
      .filter((object) => object.type === "entity")
      .reduce((acc, val) => {
        acc[val.id] = val;
        return acc;
      }, {});
  }

  public get sfx(): Record<string, ISfx> {
    return this.data.objects
      .filter((object) => object.type === "sfx")
      .reduce((acc, val) => {
        acc[val.id] = val;
        return acc;
      }, {});
  }

  public get world() {
    return this.data.level;
  }

  public static async loadData(i: number): Promise<IWorldData> {
    const { default: level } = await import(`@src/data/level${i}/level.json`);
    const { default: objects } = await import(`@src/data/level${i}/objects.json`);
    const { default: resources } = await import(`@src/data/level${i}/resources.json`);

    return {
      level,
      objects,
      resources,
    };
  }
}

export default Level;
