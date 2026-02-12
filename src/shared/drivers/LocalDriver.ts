import axios, { AxiosInstance } from "axios";

import AbstractDriver from "@src/shared/drivers/AbstractDriver";

import { IPlaceData, ISpawnpoint, IProjectBlueprint } from "@src/shared/models/world.model";

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

  public async sync(_levelId: string): Promise<void> {}

  public async place(_levelId: string, data: IPlaceData, pushToStack: boolean): Promise<void> {
    dispatch(GameEvents.placeEvent(data.layerId, data.coords, pushToStack));
  }

  public async spawn(_levelId: string, data: ISpawnpoint, pushToStack: boolean): Promise<void> {
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

  public async despawn(_levelId: string, uuid: string, pushToStack: boolean): Promise<void> {
    dispatch(GameEvents.despawnEvent(uuid, pushToStack));
  }

  public async load(projectId: string): Promise<IProjectBlueprint> {
    const response = await this.http.get<IProjectBlueprint>(`/api/projects/${projectId}`);

    this.projectId = response.data.id;
    this.version = response.data.version;

    return response.data;
  }

  public async save(data: IProjectBlueprint): Promise<IProjectBlueprint> {
    const response = await this.http.post<IProjectBlueprint>(`/api/projects/${this.projectId}`, { ...data, version: this.version });

    this.version = response.data.version;

    return response.data;
  }

  public getAssetUrl(path: string): string {
    return `${config.REST_API}/api/projects/${this.projectId}${path}`;
  }
}

export default LocalDriver;
