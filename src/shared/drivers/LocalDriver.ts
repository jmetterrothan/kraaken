import axios, { AxiosInstance } from "axios";

import AbstractDriver from "@shared/drivers/AbstractDriver";

import { IPlaceData, ISpawnpoint, ILevelBlueprint } from "@shared/models/world.model";

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

  public async sync(id: string): Promise<void> {}

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

  public async load(id: string): Promise<ILevelBlueprint> {
    this.currentLevelId = id;

    const { data } = await this.http.get(`/api/levels/${this.currentLevelId}`);
    return data;
  }

  public async save(id: string, data: ILevelBlueprint): Promise<void> {
    const { resources, entities, rooms, ...level } = data;

    await this.http.post(`/api/levels/${id}`, level);

    const room = rooms.find((room) => room.id === level.defaultRoomId);
    await this.http.post(`/api/levels/${id}/rooms/${room.id}`, room);
  }

  public getAssetUrl(path: string): string {
    return `${config.REST_API}/api/levels/${this.currentLevelId}${path}`;
  }
}

export default LocalDriver;
