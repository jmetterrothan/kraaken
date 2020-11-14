import World from "@src/world/World";

import Entity from "@src/ECS/Entity";

abstract class Weapon {
  public abstract update(world: World, owner: Entity): void;

  protected abstract use(world: World, owner: Entity): void;

  public abstract canBeUsed(world: World, owner: Entity): boolean;
}

export default Weapon;
