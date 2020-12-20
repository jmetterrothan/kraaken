import { ISpawnpoint, IWorldBlueprint } from '@shared/models/world.model';
import { IVector2 } from '@shared/models/event.model';

abstract class AbstractDriver {
  public abstract load(id: string): Promise<IWorldBlueprint>;

  public abstract ping(): Promise<void>;
  
  public abstract place(layerId: number, tileTypeId: number, coords: IVector2[], pushToStack: boolean): Promise<void>;

  public abstract spawn(spawnpoint: ISpawnpoint, pushToStack: boolean): Promise<void>;

  public abstract despawn(uuid: string, pushToStack: boolean): Promise<void>;

  public abstract save(id: string, data: IWorldBlueprint): Promise<void>;

}

export default AbstractDriver;
