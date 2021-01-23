import AbstractDriver from "@src/shared/drivers/AbstractDriver";
import LocalDriver from "@src/shared/drivers/LocalDriver";
import OnlineDriver from "@src/shared/drivers/OnlineDriver";

import config from "@src/config";

export type IDriverType = "local" | "online";

class DriverFactory {
  static get(driver: IDriverType): AbstractDriver {
    switch (driver) {
      case "local":
        return new LocalDriver();

      case "online":
        return new OnlineDriver();

      default:
        throw new Error(`Tried to instantiate an unsupported driver "${driver}"`);
    }
  }
}

export const driver = DriverFactory.get(config.DRIVER);

export default DriverFactory;
