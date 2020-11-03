import AbstractDriver from "@src/shared/drivers/AbstractDriver";
import FirebaseDriver from "@src/shared/drivers/FirebaseDriver";
import LocalDriver from "@src/shared/drivers/LocalDriver";

export type IDriverType = 'firebase' | 'local';

class DriverFactory {
  static get(driver: IDriverType): AbstractDriver {
    switch(driver) {
      case "firebase":
        return new FirebaseDriver();

      case "local":
        return new LocalDriver();

      default:
        throw new Error(`Tried to instantiate an unsupported driver "${driver}"`);
    }
  }
}

export default DriverFactory;
