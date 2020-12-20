import axios, { AxiosInstance } from 'axios';

import AbstractDriver from '@src/shared/drivers/AbstractDriver';
import dispatch, * as GameEvents from '@src/shared/events';

import { IVector2 } from '@shared/models/math.model';
import { ISpawnpoint, IWorldBlueprint } from '@shared/models/world.model';

import  config  from '@src/config';

class LocalDriver extends AbstractDriver {
  private http: AxiosInstance;

  public constructor() {
    super();

    this.http = axios.create({
      baseURL: config.REST_API,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }

  public async ping(): Promise<void> {
    await this.http.get(`/api`);
  }

  public async place(layerId: number, tileTypeId: number, coords: IVector2[], pushToStack: boolean): Promise<void> {
    dispatch(
      GameEvents.placeEvent(
        layerId,
        tileTypeId,
        coords,
        pushToStack
      )
    );
  }

  public async spawn(spawnpoint: ISpawnpoint, pushToStack: boolean): Promise<void> {
    dispatch(GameEvents.spawnEvent(
      spawnpoint.uuid, //
      spawnpoint.type,
      spawnpoint.position,
      spawnpoint.direction,
      spawnpoint.debug,
      pushToStack
    ));
  }

  public async despawn(uuid: string, pushToStack: boolean): Promise<void> {
    dispatch(GameEvents.despawnEvent(uuid, pushToStack));
  }

  public async load(id: string): Promise<IWorldBlueprint> {
    const { data: level } = await this.http.get(`/levels/${id}/level.json`);
    const { data: entities } = await this.http.get(`/levels/${id}/entities.json`);
    const { data: resources } = await this.http.get(`/levels/${id}/resources.json`);
  
    return { 
      level,
      entities,
      sprites: resources.sprites,
      sounds: resources.sounds
    };
  }

  public async save(id: string, data: IWorldBlueprint): Promise<void> {
    await this.http.post(`/api/${id}`, data.level);
  }
}

export default LocalDriver;
