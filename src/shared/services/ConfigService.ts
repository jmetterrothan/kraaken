import DriverFactory from '@src/shared/drivers/DriverFactory';
import AbstractDriver from '@src/shared/drivers/AbstractDriver';

import config from '@src/config';

import { IDimension } from "@shared/models/game.model";

class ConfigService {
  public scale: number;

  public frameSize: IDimension;
  public innerSize: IDimension;

  public driver: AbstractDriver;

  public constructor() {
    this.frameSize = { w: -1, h: -1 };
    this.innerSize = { w: -1, h: -1 };

    this.driver = DriverFactory.get(config.DRIVER);
  }
}

export const configSvc = new ConfigService();
