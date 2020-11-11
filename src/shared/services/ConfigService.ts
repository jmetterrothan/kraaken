import { IDimension } from "@shared/models/game.model";

class ConfigService {
  public scale: number;

  public frameSize: IDimension;
  public innerSize: IDimension;

  public constructor() {
    this.frameSize = { w: -1, h: -1 };
    this.innerSize = { w: -1, h: -1 };
  }
}

export const configSvc = new ConfigService();
