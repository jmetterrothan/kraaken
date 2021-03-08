import LocalDriver from "@shared/drivers/LocalDriver";

import { wsSvc } from "@shared/services/WebSocketService";

import { IPlaceData, ISpawnpoint, IWorldBlueprint } from "@shared/models/world.model";

class OnlineDriver extends LocalDriver {
  public constructor() {
    super();

    // WS
    wsSvc.connect();
  }

  public async sync(id: string): Promise<void> {
    await wsSvc.sync(id);
  }

  public async place(data: IPlaceData, pushToStack: boolean): Promise<void> {
    await wsSvc.placeEvent(this.currentLevelId, data, pushToStack);
  }

  public async spawn(spawnpoint: ISpawnpoint, pushToStack: boolean): Promise<void> {
    await wsSvc.spawnEvent(this.currentLevelId, spawnpoint, pushToStack);
  }

  public async despawn(uuid: string, pushToStack: boolean): Promise<void> {
    await wsSvc.despawnEvent(this.currentLevelId, uuid, pushToStack);
  }

  public async load(id: string): Promise<IWorldBlueprint> {
    await wsSvc.joinRoom(id);

    return super.load(id);
  }

  public async save(id: string, data: IWorldBlueprint): Promise<void> {
    await super.save(id, data);
    await wsSvc.resetRoom(id);
  }
}

export default OnlineDriver;
