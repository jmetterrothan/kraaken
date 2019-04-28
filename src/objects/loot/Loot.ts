import Vector2 from '@shared/math/Vector2';
import Entity from '@src/objects/entity/Entity';
import World from '@src/world/World';

import { IConsummable } from '@shared/models/loot.model';
import { IEntityData, IMetadata } from '@src/shared/models/entity.model';

abstract class Loot extends Entity implements IConsummable {
  protected sfx: string;
  protected consummated: boolean;

  constructor(x: number, y: number, direction: Vector2, data: IEntityData, metadata: IMetadata) {
    super(x, y, direction, data);
    this.sfx = metadata.sfx || undefined;
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
          break;
        }
      }
    }
  }

  public abstract consummatedBy(entity: Entity): void;
  public abstract canBeConsummatedBy(entity: Entity): boolean;
}

export default Loot;
