import Entity from '@src/objects/entity/Entity';
import Loot from '@src/objects/loot/Loot';

class DamageEffectConsummable extends Loot {
  public consummatedBy(entity: Entity): void {
    console.log(`entity ${entity.getUUID()} consummated heal potion`);
    this.setDirty(true);
  }
}

export default DamageEffectConsummable;
