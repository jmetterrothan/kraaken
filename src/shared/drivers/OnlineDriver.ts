import LocalDriver from "@src/shared/drivers/LocalDriver";

import { wsSvc } from "@src/shared/services/WebSocketService";

import { IPlaceData, ISpawnpoint, ILevelBlueprint } from "@src/shared/models/world.model";

class OnlineDriver extends LocalDriver {
  public constructor() {
    super();

    // WS
    wsSvc.connect();
  }

  public async sync(roomId: string): Promise<void> {
    await wsSvc.sync(roomId);
  }

  public async place(roomId: string, data: IPlaceData, pushToStack: boolean): Promise<void> {
    await wsSvc.placeEvent(roomId, data, pushToStack);
  }

  public async spawn(roomId: string, spawnpoint: ISpawnpoint, pushToStack: boolean): Promise<void> {
    await wsSvc.spawnEvent(roomId, spawnpoint, pushToStack);
  }

  public async despawn(roomId: string, uuid: string, pushToStack: boolean): Promise<void> {
    await wsSvc.despawnEvent(roomId, uuid, pushToStack);
  }

  public async load(id: string): Promise<ILevelBlueprint> {
    await wsSvc.joinRoom(id);

    return super.load(id);
  }

  public async save(roomId: string, data: ILevelBlueprint): Promise<void> {
    await super.save(roomId, data);
    await wsSvc.resetRoom(roomId);
  }
}

export default OnlineDriver;
