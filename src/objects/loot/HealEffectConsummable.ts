import Entity from '@src/objects/entity/Entity';
import Loot from '@src/objects/loot/Loot';
import SFX from '@src/objects/sfx/SFX';

import data from '@src/data';

class HealEffectConsummable extends Loot {
  public consummatedBy(entity: Entity): void {
    this.add(new SFX(this.getX(), this.getY(), data.sfx.star));

    this.setVisible(false);
    this.setDirty(true);

    console.log(`entity ${entity.getUUID()} consummated heal potion`);
  }
}

export default HealEffectConsummable;
