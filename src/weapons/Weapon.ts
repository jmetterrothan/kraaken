import World from "@src/world/World";

import Entity from "@src/ECS/Entity";

abstract class Weapon {
  public abstract update(world: World, owner: Entity);

  protected abstract use(world: World, owner: Entity);
}

export default Weapon;
