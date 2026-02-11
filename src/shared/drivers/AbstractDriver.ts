import { IPlaceData, ISpawnpoint, ILevelBlueprint } from "@src/shared/models/world.model";

abstract class AbstractDriver {
  protected levelId: string;

  public abstract ping(): Promise<void>;

  public abstract load(levelId: string): Promise<ILevelBlueprint>;

  public abstract getAssetUrl(path: string): string;

  public abstract sync(roomId: string): Promise<void>;

  public abstract place(roomId: string, data: IPlaceData, pushToStack: boolean): Promise<void>;

  public abstract spawn(roomId: string, data: ISpawnpoint, pushToStack: boolean): Promise<void>;

  public abstract despawn(roomId: string, uuid: string, pushToStack: boolean): Promise<void>;

  public abstract save(roomId: string, data: ILevelBlueprint): Promise<void>;
}

export default AbstractDriver;
