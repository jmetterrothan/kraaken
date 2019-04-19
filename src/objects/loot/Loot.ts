import { IConsummable } from '@shared/models/loot.model';
import Entity from '@src/objects/entity/Entity';
import { IEntityData } from '@src/shared/models/entity.model';
import World from '@src/world/World';

abstract class Loot extends Entity implements IConsummable {
  private consummated: boolean;

  constructor(x: number, y: number, data: IEntityData) {
    super(x, y, data);

    this.consummated = false;
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
