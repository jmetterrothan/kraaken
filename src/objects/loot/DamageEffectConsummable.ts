import Entity from '@src/objects/entity/Entity';
import Player from '@src/objects/entity/Player';
import Loot from '@src/objects/loot/Loot';
import SFX from '@src/objects/sfx/SFX';
import Vector2 from '@src/shared/math/Vector2';

class DamageEffectConsummable extends Loot {
  public consummatedBy(entity: Entity): void {
    if (this.sfx) {
      this.add(SFX.create(this.getX(), this.getY(), new Vector2(1, 1), this.sfx));
    }

    console.log(entity.getUUID());

    this.consummated = true;

    this.setVisible(false);
    this.setDirty(true);
  }

  public canBeConsummatedBy(entity: Entity): boolean {
    return entity instanceof Player;
  }
}

export default DamageEffectConsummable;
