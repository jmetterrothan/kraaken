import { IDriverType } from './shared/drivers/DriverFactory';

interface IConfig {
  DRIVER: IDriverType;
  DEBUG: boolean;
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
  DRIVER: (process.env.DRIVER || 'local') as IDriverType,
  DEBUG: (process.env.DEBUG || 'true') === 'true',
  TARGET_UPS: process.env.TARGET_UPS ? parseInt(process.env.TARGET_UPS, 10) : 50,
  FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
  FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL,
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID: process.env.FIREBASE_APP_ID
}

export default config;
