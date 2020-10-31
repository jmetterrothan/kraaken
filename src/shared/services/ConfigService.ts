import DriverFactory from '@src/shared/drivers/DriverFactory';
import AbstractDriver from '@src/shared/drivers/AbstractDriver';

import { IDimension } from "@shared/models/game.model";

class ConfigService {
  public debug = true;

  public scale: number;

  public frameSize: IDimension = { w: -1, h: -1 };
  public innerSize: IDimension = { w: -1, h: -1 };

  public driver: AbstractDriver = DriverFactory.get(process.env.DRIVER || 'local');
}

export const configSvc = new ConfigService();
