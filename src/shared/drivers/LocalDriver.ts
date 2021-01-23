import axios, { AxiosInstance } from "axios";

import AbstractDriver from "@shared/drivers/AbstractDriver";

import { IPlaceData, ISpawnpoint, IWorldBlueprint } from "@shared/models/world.model";

import dispatch, * as GameEvents from "@src/shared/events";

import config from "@src/config";

class LocalDriver extends AbstractDriver {
  protected http: AxiosInstance;
  protected currentLevelId: string;

  public constructor() {
    super();

    this.http = axios.create({
      baseURL: config.REST_API,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  public async ping(): Promise<void> {
    await this.http.get(`/api`);
  }

  public async place(data: IPlaceData, pushToStack: boolean): Promise<void> {
    dispatch(GameEvents.placeEvent(data.layerId, data.tileTypeId, data.coords, pushToStack));
  }

  public async spawn(data: ISpawnpoint, pushToStack: boolean): Promise<void> {
    dispatch(
      GameEvents.spawnEvent(
        data.uuid, //
        data.type,
        data.position,
        data.direction,
        data.debug,
        pushToStack
      )
    );
  }

  public async despawn(uuid: string, pushToStack: boolean): Promise<void> {
    dispatch(GameEvents.despawnEvent(uuid, pushToStack));
  }

  public async load(id: string): Promise<IWorldBlueprint> {
    this.currentLevelId = id;

    const { data } = await this.http.get(`/api/levels/${this.currentLevelId}`);

    return {
      level: data.level,
      entities: data.entities,
      sprites: data.resources.sprites,
      sounds: data.resources.sounds,
    };
  }

  public async save(id: string, data: IWorldBlueprint): Promise<void> {
    await this.http.post(`/api/levels/${id}`, data.level);
  }

  public getAssetUrl(path: string): string {
    return `${config.REST_API}/api/levels/${this.currentLevelId}${path}`;
  }
}

export default LocalDriver;
