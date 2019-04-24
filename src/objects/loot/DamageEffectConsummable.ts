import Character from '@src/objects/entity/Character';
import Entity from '@src/objects/entity/Entity';
import Loot from '@src/objects/loot/Loot';
import SFX from '@src/objects/sfx/SFX';
import Vector2 from '@src/shared/math/Vector2';

class DamageEffectConsummable extends Loot {
  public consummatedBy(entity: Entity): void {
    this.add(SFX.create(this.getX(), this.getY(), new Vector2(1, 1), 'explosion'));

    this.setVisible(false);
    this.setDirty(true);
  }

  public canBeConsummatedBy(entity: Entity): boolean {
    return entity instanceof Character;
  }
}

export default DamageEffectConsummable;
