import { IWorldBlueprint } from '@shared/models/world.model';

abstract class AbstractDriver {
  public abstract async load(id: string): Promise<IWorldBlueprint>;

  public abstract async ping(): Promise<void>;
  
  public abstract async save(id: string, data: IWorldBlueprint): Promise<void>;

}

export default AbstractDriver;
