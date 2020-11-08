import axios, { AxiosInstance } from 'axios';

import AbstractDriver from '@src/shared/drivers/AbstractDriver';

import { IWorldBlueprint } from '@shared/models/world.model';

import  config  from '@src/config';

class LocalDriver extends AbstractDriver {
  private http: AxiosInstance;

  public constructor() {
    super();

    this.http = axios.create({
      baseURL: config.LOCAL_API,
    });
  }

  public async load(id: string): Promise<IWorldBlueprint> {
    const { data: level } = await this.http.get(`/${id}/level`);
    
    const { default: entities } = await import(`@root/local/data/${id}/entities.json`);
    const { default: resources } = await import(`@root/local/data/${id}/resources.json`);

    return { 
      level,
      entities,
      sprites: resources.sprites,
      sounds: resources.sounds
    };
  }

  public async save(id: string, data: IWorldBlueprint): Promise<void> {
    await this.http.post(`/${id}/level`, data.level);
  }
}

export default LocalDriver;
