import Entity from '@src/objects/entity/Entity';
import World from '@src/world/World';

import { IConsummable } from '@shared/models/loot.model';
import { IEntityData } from '@src/shared/models/entity.model';

abstract class Loot extends Entity implements IConsummable {
  private consummated: boolean;

  constructor(x: number, y: number, entityData: IEntityData) {
    super(x, y, entityData);

    this.consummated = false;

    // this.add(new Box2Helper(this.getBbox(), { r: 1, g: 0, b: 0 }));
  }

  public update(world: World, delta: number) {
    super.update(world, delta);

    if (!this.consummated) {
      const entities = world.getActiveEntities();

      for (const entity of entities) {
        if (!(entity instanceof Entity) || !this.canBeConsummatedBy(entity) || this === entity) {
          continue;
        }

        if (entity.collideWith(this)) {
          this.consummatedBy(entity);
          this.consummated = true;

          break;
        }
      }
    }
  }

  public abstract consummatedBy(entity: Entity): void;
  public abstract canBeConsummatedBy(entity: Entity): boolean;
}

export default Loot;
