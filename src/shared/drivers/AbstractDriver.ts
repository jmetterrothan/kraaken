import { IPlaceData, ISpawnpoint, IWorldBlueprint } from '@shared/models/world.model';

abstract class AbstractDriver {
  public abstract load(id: string): Promise<IWorldBlueprint>;

  public abstract ping(): Promise<void>;
  
  public abstract place(data: IPlaceData, pushToStack: boolean): Promise<void>;

  public abstract spawn(data: ISpawnpoint, pushToStack: boolean): Promise<void>;

  public abstract despawn(uuid: string, pushToStack: boolean): Promise<void>;

  public abstract save(id: string, data: IWorldBlueprint): Promise<void>;

}

export default AbstractDriver;
