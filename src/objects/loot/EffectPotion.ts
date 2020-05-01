import Entity from "@src/objects/entity/Entity";
import Player from "@src/objects/entity/Player";
import Loot from "@src/objects/loot/Loot";
import SFX from "@src/objects/sfx/SFX";
import Vector2 from "@src/shared/math/Vector2";

import { IEffectPotion } from "@src/shared/models/entity.model";

class EffectPotion extends Loot {
  constructor(uuid: string, x: number, y: number, direction: Vector2, data: IEffectPotion) {
    super(uuid, x, y, direction, data);
  }

  public consummatedBy(player: Player): void {
    if (this.sfx) {
      this.add(SFX.createPooled(this.getX(), this.getY(), new Vector2(1, 1), this.sfx));
    }

    this.consummated = true;

    this.setVisible(false);
    this.setDirty(true);
  }

  public canBeConsummatedBy(entity: Entity): boolean {
    return this !== entity && entity instanceof Player;
  }
}

export default EffectPotion;
