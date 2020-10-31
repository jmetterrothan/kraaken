import AbstractDriver from "@src/shared/drivers/AbstractDriver";
import FirebaseDriver from "@src/shared/drivers/FirebaseDriver";
import LocalDriver from "@src/shared/drivers/LocalDriver";

class DriverFactory {
  static get(driver: string): AbstractDriver {
    switch(driver) {
      case "firebase":
        return new FirebaseDriver();

      case "local":
        return new LocalDriver();

      default:
        throw new Error();
    }
  }
}

export default DriverFactory;
