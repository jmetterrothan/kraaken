import { IPlaceData, ISpawnpoint, ILevelBlueprint } from "@shared/models/world.model";

abstract class AbstractDriver {
  public abstract load(id: string): Promise<ILevelBlueprint>;

  public abstract ping(): Promise<void>;

  public abstract sync(id: string): Promise<void>;

  public abstract place(data: IPlaceData, pushToStack: boolean): Promise<void>;

  public abstract spawn(data: ISpawnpoint, pushToStack: boolean): Promise<void>;

  public abstract despawn(uuid: string, pushToStack: boolean): Promise<void>;

  public abstract save(id: string, data: ILevelBlueprint): Promise<void>;

  public abstract getAssetUrl(path: string): string;
}

export default AbstractDriver;
