import { IWorldBlueprint } from '@shared/models/world.model';

abstract class AbstractDriver {
  public abstract load(id: string): Promise<IWorldBlueprint>;

  public abstract ping(): Promise<void>;
  
  public abstract save(id: string, data: IWorldBlueprint): Promise<void>;

}

export default AbstractDriver;
