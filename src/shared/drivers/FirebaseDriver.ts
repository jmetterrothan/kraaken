import pako from 'pako';

import AbstractDriver from '@src/shared/drivers/AbstractDriver';

import FirebaseConnector from '@shared/connectors/FirebaseConnector';

import { TileLayer } from '@shared/models/tilemap.model';
import { ISpawnpoint } from '@shared/models/world.model';
import { IWorldBlueprint } from '@shared/models/world.model';

const decompress = (data) => JSON.parse(atob(pako.inflate(data, { to: 'string' })));

const compress = (data) => Array.from(pako.deflate(btoa(JSON.stringify(data))));

class FirebaseDriver extends AbstractDriver {
  private connector: FirebaseConnector;

  public constructor() {
    super();

    this.connector = FirebaseConnector.create();
  }

  public async loadSpawnPoints (id: string): Promise<ISpawnpoint[]> {
    const levelRef = await this.getLevelRef(id);
    const spawnPointsSnapshot = await levelRef.collection('spawnPoints').get();

    return spawnPointsSnapshot.docs.map((doc) => doc.data()) as ISpawnpoint[];
  }

  public async load(id: string): Promise<IWorldBlueprint> {
    const levelRef = await this.getLevelRef(id);
    const levelDoc = await levelRef.get();

    if (!levelDoc.exists) {
      throw new Error(`Unknown level "${id}"`);
    }

    const levelData = levelDoc.data();

    let level;
    try {
      level = {
        ...levelData,
        layers: {
          [TileLayer.L0]: decompress(levelData.tileMapLayer1),
          [TileLayer.L1]: decompress(levelData.tileMapLayer2),
          [TileLayer.L2]: decompress(levelData.tileMapLayer3),
        },
      };
    } catch(e) {
      console.log(e);
    }

    const { default: entities } = await import(`@root/local/${id}/entities.json`);
    const { default: resources } = await import(`@root/local/${id}/resources.json`);

    const spawnPoints = await this.loadSpawnPoints(id);

    return {
      level: {
        ...level,
        spawnPoints, 
      },
      entities,
      sprites: resources.sprites,
      sounds: resources.sounds
    }
  }

  public async save(id: string, data: IWorldBlueprint): Promise<void> {
    const levelRef = await this.getLevelRef(id);
   
    await levelRef.set({
      layers: {
        [TileLayer.L0]: compress(data.level.layers[TileLayer.L0]),
        [TileLayer.L1]: compress(data.level.layers[TileLayer.L1]),
        [TileLayer.L2]: compress(data.level.layers[TileLayer.L2])
      }
    }, { merge: true });
  }

  private async getLevelRef(id: string): Promise<firebase.firestore.DocumentReference<firebase.firestore.DocumentData>> {
    return this.connector.db.collection('levels').doc(id);
  }
}

export default FirebaseDriver;
