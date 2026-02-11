import axios, { AxiosInstance } from "axios";

import AbstractDriver from "@src/shared/drivers/AbstractDriver";

import { IPlaceData, ISpawnpoint, ILevelBlueprint } from "@src/shared/models/world.model";

import dispatch, * as GameEvents from "@src/shared/events";

import config from "@src/config";

class LocalDriver extends AbstractDriver {
  protected http: AxiosInstance;

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

  public async sync(_roomId: string): Promise<void> {}

  public async place(_roomId: string, data: IPlaceData, pushToStack: boolean): Promise<void> {
    dispatch(GameEvents.placeEvent(data.layerId, data.coords, pushToStack));
  }

  public async spawn(_roomId: string, data: ISpawnpoint, pushToStack: boolean): Promise<void> {
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

  public async despawn(_roomId: string, uuid: string, pushToStack: boolean): Promise<void> {
    dispatch(GameEvents.despawnEvent(uuid, pushToStack));
  }

  public async load(levelId: string): Promise<ILevelBlueprint> {
    this.levelId = levelId;

    const { data } = await this.http.get(`/api/levels/${levelId}`);
    return data;
  }

  public async save(roomId: string, data: ILevelBlueprint): Promise<void> {
    const { resources, entities, rooms, ...level } = data;

    await this.http.post(`/api/levels/${this.levelId}`, level);

    const room = rooms.find((room) => room.id === roomId);

    if (!room) {
      throw new Error(`Could not find level room "${roomId}"`);
    }

    await this.http.post(`/api/levels/${this.levelId}/rooms/${room.id}`, room);
  }

  public getAssetUrl(path: string): string {
    return `${config.REST_API}/api/levels/${this.levelId}${path}`;
  }
}

export default LocalDriver;
