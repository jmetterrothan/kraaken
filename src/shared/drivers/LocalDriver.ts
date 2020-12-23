import axios, { AxiosInstance } from 'axios';

import AbstractDriver from '@shared/drivers/AbstractDriver';

import { wsSvc } from '@shared/services/WebSocketService';

import { IPlaceData, ISpawnpoint, IWorldBlueprint } from '@shared/models/world.model';

import  config  from '@src/config';

class LocalDriver extends AbstractDriver {
  private http: AxiosInstance;
  private id: string;

  public constructor() {
    super();

    this.http = axios.create({
      baseURL: config.REST_API,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    // WS
    wsSvc.connect();
  }

  public async ping(): Promise<void> {
    await this.http.get(`/api`);
  }

  public async place(data: IPlaceData, pushToStack: boolean): Promise<void> {
    await wsSvc.placeEvent(this.id, data, pushToStack);
  }

  public async spawn(spawnpoint: ISpawnpoint, pushToStack: boolean): Promise<void> {
    await wsSvc.spawnEvent(this.id, spawnpoint, pushToStack);
  }

  public async despawn(uuid: string, pushToStack: boolean): Promise<void> {
    await wsSvc.despawnEvent(this.id, uuid, pushToStack);
  }

  public async load(id: string): Promise<IWorldBlueprint> {
    this.id = id;

    await wsSvc.joinRoom(this.id);

    const { data } = await this.http.get(`/api/levels/${this.id}`);
  
    return { 
      level: data.level,
      entities: data.entities,
      sprites: data.resources.sprites,
      sounds: data.resources.sounds
    };
  }

  public async save(id: string, data: IWorldBlueprint): Promise<void> {
    await this.http.post(`/api/levels/${id}`, data.level);
  }
}

export default LocalDriver;
