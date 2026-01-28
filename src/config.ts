import { IDriverType } from "./shared/drivers/DriverFactory";

interface IConfig {
  DRIVER: IDriverType;
  DEBUG: boolean;
  REST_API: string;
  WEBSOCKET_API: string;
  TARGET_UPS: number;
}

const config: IConfig = {
  DRIVER: (import.meta.env.VITE_DRIVER ?? "local") as IDriverType,
  DEBUG: import.meta.env.VITE_DEBUG === "true",
  REST_API: import.meta.env.VITE_REST_API,
  WEBSOCKET_API: import.meta.env.VITE_WEBSOCKET_API,
  TARGET_UPS: import.meta.env.VITE_TARGET_UPS ? parseInt(import.meta.env.VITE_TARGET_UPS, 10) : 50,
};

export default config;
