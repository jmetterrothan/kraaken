import SFX from "@src/objects/sfx/SFX";

import { IWorldData } from "@src/shared/models/world.model";

class Level {
  public readonly id: number;

  private data: IWorldData;

  public constructor(id: number, data: IWorldData) {
    this.id = id;
    this.data = data;

    SFX.DATA = data.sfx;
  }

  public get entities() {
    return this.data.entities;
  }

  public get sprites() {
    return this.data.sprites;
  }

  public get loots() {
    return this.data.loots;
  }

  public get sfx() {
    return this.data.sfx;
  }

  public get world() {
    return this.data.level;
  }

  public static async loadData(i: number): Promise<IWorldData> {
    const { default: level } = await import(`@src/data/level${i}/level.json`);
    const { default: sprites } = await import(`@src/data/level${i}/sprites.js`);
    const { default: sfx } = await import(`@src/data/level${i}/sfx.json`);
    const { default: entities } = await import(`@src/data/level${i}/entities.json`);
    const { default: loots } = await import(`@src/data/level${i}/loots.json`);

    return {
      level,
      sprites,
      sfx,
      entities,
      loots,
    };
  }
}

export default Level;
