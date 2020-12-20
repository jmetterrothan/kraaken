import World from "@src/world/World";

export abstract class System {
  public readonly componentTypes: ReadonlyArray<string>;

  private _world: World | undefined;

  public constructor(componentTypes: ReadonlyArray<string>) {
    this.componentTypes = componentTypes;
  }

  public abstract execute(delta: number): void;

  public addedToWorld(world: World): void {
    this._world = world;
  }

  public removedFromWorld(world: World): void {
    this._world = undefined;
  }

  public get world(): World {
    if (!this._world) {
      throw new Error(`System "${this.constructor.name}" has not been added to the world yet`);
    }
    return this._world;
  }
}
