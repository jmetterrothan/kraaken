import pako from 'pako';
import * as firebase from 'firebase';

import 'firebase/firestore';

import AbstractDriver from '@src/shared/drivers/AbstractDriver';

import { IWorldBlueprint } from '@shared/models/world.model';
import { ILevelBlueprint } from '@shared/models/world.model';

import config from '@src/config';

const decompress = (data) => JSON.parse(atob(pako.inflate(data, { to: 'string' })));

const compress = (data) => Array.from(pako.deflate(btoa(JSON.stringify(data))));

class FirebaseDriver extends AbstractDriver {
  private app: firebase.app.App;
  private db: firebase.firestore.Firestore;

  public constructor() {
    super();

    this.app = firebase.initializeApp({
      apiKey: config.FIREBASE_API_KEY,
      authDomain: config.FIREBASE_AUTH_DOMAIN,
      databaseURL: config.FIREBASE_DATABASE_URL,
      projectId: config.FIREBASE_PROJECT_ID,
      storageBucket: config.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: config.FIREBASE_MESSAGING_SENDER_ID,
      appId: config.FIREBASE_APP_ID,
    });

    this.db = this.app.firestore();
  }

  public async load(id: string): Promise<IWorldBlueprint> {
    const levelRef = await this.db.collection('levels').doc(id);
    const levelDoc = await levelRef.get();

    if (!levelDoc.exists) {
      throw new Error(`Unknown level "${id}"`);
    }

    const levelData = levelDoc.data() as ILevelBlueprint;

    const level = {
      ...levelData,
      tileMapLayer1: decompress(levelData.tileMapLayer1),
      tileMapLayer2: decompress(levelData.tileMapLayer2),
      tileMapLayer3: decompress(levelData.tileMapLayer3)
    };

    const { default: entities } = await import(`@src/data/${id}/entities.json`);
    const { default: resources } = await import(`@src/data/${id}/resources.json`);

    return {
      level, entities,
      sprites: resources.sprites,
      sounds: resources.sounds
    }
  }

  public async save(id: string, levelData: Partial<ILevelBlueprint>): Promise<void> {
    const levelRef = await this.db.collection('levels').doc(id);

    let temp = levelData as any;
   
    if ('tileMapLayer1' in temp) {
      temp = {
        ...temp,
        tileMapLayer1: compress(temp.tileMapLayer1),
      }
    }

    if ('tileMapLayer2' in temp) {
      temp = {
        ...temp,
        tileMapLayer2: compress(temp.tileMapLayer2),
      }
    }

    if ('tileMapLayer3' in temp) {
      temp = {
        ...temp,
        tileMapLayer3: compress(temp.tileMapLayer3),
      }
    }

    await levelRef.set(temp, { merge: true })
  }
}

export default FirebaseDriver;
