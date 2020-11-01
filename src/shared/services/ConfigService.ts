import DriverFactory from '@src/shared/drivers/DriverFactory';
import AbstractDriver from '@src/shared/drivers/AbstractDriver';

import { IDimension } from "@shared/models/game.model";

class ConfigService {
  public readonly debug: boolean = process.env.DEBUG === "true";
  public readonly driver: AbstractDriver = DriverFactory.get(process.env.DRIVER || 'local');

  // dynamic properties
  public scale: number;

  public frameSize: IDimension = { w: -1, h: -1 };
  public innerSize: IDimension = { w: -1, h: -1 };
}

export const configSvc = new ConfigService();
