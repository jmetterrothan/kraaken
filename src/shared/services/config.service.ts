import { IDimension } from '@shared/models/game.model';

class ConfigService {
  public debug: boolean;

  public scale: number;

  public frameSize: IDimension;
  public innerSize: IDimension;

  constructor() {
    this.debug = true;

    this.frameSize = { w: -1, h: -1 };
    this.innerSize = { w: -1, h: -1 };
  }
}

export const configSvc = new ConfigService();
