import World from "@src/world/World";

abstract class System {
  public readonly componentTypes: ReadonlyArray<symbol>;

  private _world: World | undefined;

  public constructor(componentTypes: ReadonlyArray<symbol>) {
    this.componentTypes = componentTypes;
  }

  public abstract execute(delta: number): void;

  public addedToWorld(world: World) {
    this._world = world;
  }

  public removedFromWorld(world: World): void {
    this._world = undefined;
  }

  public get world(): World {
    if (!this._world) {
      throw new Error("System has not been added to the world yet");
    }
    return this._world;
  }
}

export default System;
