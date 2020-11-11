import AbstractDriver from "@src/shared/drivers/AbstractDriver";
import LocalDriver from "@src/shared/drivers/LocalDriver";

import config from '@src/config';

export type IDriverType = 'local';

class DriverFactory {
  static get(driver: IDriverType): AbstractDriver {
    switch(driver) {
      case "local":
        return new LocalDriver();

      default:
        throw new Error(`Tried to instantiate an unsupported driver "${driver}"`);
    }
  }
}

export const driver = DriverFactory.get(config.DRIVER);

export default DriverFactory;
