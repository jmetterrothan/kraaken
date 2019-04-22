import Character from '@src/objects/entity/Character';
import Entity from '@src/objects/entity/Entity';
import Loot from '@src/objects/loot/Loot';
import SFX from '@src/objects/sfx/SFX';

class DamageEffectConsummable extends Loot {
  public consummatedBy(entity: Entity): void {
    this.add(SFX.create(this.getX(), this.getY(), 'explosion'));

    this.setVisible(false);
    this.setDirty(true);

    console.log(`entity ${entity.getUUID()} consummated damage potion`);
  }

  public canBeConsummatedBy(entity: Entity): boolean {
    return entity instanceof Character;
  }
}

export default DamageEffectConsummable;
