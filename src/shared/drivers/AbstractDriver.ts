import { IWorldBlueprint } from '@shared/models/world.model';
import { ILevelBlueprint } from '@shared/models/world.model';

abstract class AbstractDriver {
  public abstract async load(id: string): Promise<IWorldBlueprint>;
  public abstract async save(id: string, levelData: Partial<ILevelBlueprint>): Promise<void>;
}

export default AbstractDriver;
