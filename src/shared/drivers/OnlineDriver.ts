import LocalDriver from "@src/shared/drivers/LocalDriver";

import { wsSvc } from "@src/shared/services/WebSocketService";

import { IPlaceData, ISpawnpoint, IProjectBlueprint } from "@src/shared/models/world.model";

class OnlineDriver extends LocalDriver {
  public constructor() {
    super();

    // WS
    wsSvc.connect();
  }

  public async sync(levelId: string): Promise<void> {
    await wsSvc.sync(levelId);
  }

  public async place(levelId: string, data: IPlaceData, pushToStack: boolean): Promise<void> {
    await wsSvc.placeEvent(levelId, data, pushToStack);
  }

  public async spawn(levelId: string, spawnpoint: ISpawnpoint, pushToStack: boolean): Promise<void> {
    await wsSvc.spawnEvent(levelId, spawnpoint, pushToStack);
  }

  public async despawn(levelId: string, uuid: string, pushToStack: boolean): Promise<void> {
    await wsSvc.despawnEvent(levelId, uuid, pushToStack);
  }

  public async load(projectId: string): Promise<IProjectBlueprint> {
    await wsSvc.joinLevel(projectId);

    return super.load(projectId);
  }

  public async save(data: IProjectBlueprint): Promise<IProjectBlueprint> {
    return await super.save(data);
  }
}

export default OnlineDriver;
