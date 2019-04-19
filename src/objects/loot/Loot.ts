import Entity from '@src/objects/entity/Entity';
import Box2Helper from '@src/shared/helper/Box2Helper';
import World from '@src/world/World';

import { IConsummable } from '@shared/models/loot.model';
import { IEntityData } from '@src/shared/models/entity.model';

abstract class Loot extends Entity implements IConsummable {
  private consummated: boolean;

  constructor(x: number, y: number, data: IEntityData) {
    super(x, y, data);

    this.consummated = false;

    // this.add(new Box2Helper(this.getBbox(), { r: 1, g: 0, b: 0 }));
  }

  public update(world: World, delta: number) {
    super.update(world, delta);

    const player = world.getPlayer();

    if (!this.consummated && player.collideWith(this)) {
      this.consummatedBy(player);
      this.consummated = true;
    }
  }

  public abstract consummatedBy(entity: Entity);
}

export default Loot;
