import { IDriverType } from "./shared/drivers/DriverFactory";

interface IConfig {
  DRIVER: IDriverType;
  DEBUG: boolean;
  REST_API: string;
  WEBSOCKET_API: string;
  TARGET_UPS: number;
  FIREBASE_API_KEY: string;
  FIREBASE_AUTH_DOMAIN: string;
  FIREBASE_DATABASE_URL: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_STORAGE_BUCKET: string;
  FIREBASE_MESSAGING_SENDER_ID: string;
  FIREBASE_APP_ID: string;
}

const config: IConfig = {
  DRIVER: (import.meta.env.VITE_DRIVER ?? "local") as IDriverType,
  DEBUG: import.meta.env.VITE_DEBUG === "true",
  REST_API: import.meta.env.VITE_REST_API,
  WEBSOCKET_API: import.meta.env.VITE_WEBSOCKET_API,
  TARGET_UPS: import.meta.env.VITE_TARGET_UPS ? parseInt(import.meta.env.VITE_TARGET_UPS, 10) : 50,
  FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  FIREBASE_DATABASE_URL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
};

export default config;
