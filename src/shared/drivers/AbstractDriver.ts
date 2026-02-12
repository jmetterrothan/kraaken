import { IPlaceData, ISpawnpoint, IProjectBlueprint } from "@src/shared/models/world.model";
import { storageSvc } from "../services/StorageService";

abstract class AbstractDriver {
  protected projectId: string;
  protected version: number;

  public abstract ping(): Promise<void>;

  public abstract load(projectId: string): Promise<IProjectBlueprint>;

  public abstract getAssetUrl(path: string): string;

  public abstract sync(levelId: string): Promise<void>;

  public abstract place(levelId: string, data: IPlaceData, pushToStack: boolean): Promise<void>;

  public abstract spawn(levelId: string, data: ISpawnpoint, pushToStack: boolean): Promise<void>;

  public abstract despawn(levelId: string, uuid: string, pushToStack: boolean): Promise<void>;

  public abstract save(data: IProjectBlueprint): Promise<IProjectBlueprint>;

  public backup(data: IProjectBlueprint): void {
    storageSvc.set(this.projectId, data);
  }

  public recover(): IProjectBlueprint | null {
    return storageSvc.get<IProjectBlueprint>(this.projectId);
  }
}

export default AbstractDriver;
