import Entity from "@src/objects/entity/Entity";
import Player from "@src/objects/entity/characters/Player";
import Consummable from "@src/objects/entity/consummable/Consummable";
import SFX from "@src/objects/sfx/SFX";
import Vector2 from "@src/shared/math/Vector2";

import { IEffectPotion } from "@src/shared/models/consummable.model";

import pickUpSoundFX from "@src/data/level1/assets/sounds/pickup.wav";

class EffectPotion extends Consummable {
  protected pickUpSoundFX: Howl;

  constructor(uuid: string, x: number, y: number, direction: Vector2, data: IEffectPotion) {
    super(uuid, x, y, direction, data);

    this.pickUpSoundFX = new Howl({
      src: pickUpSoundFX,
      autoplay: false,
      volume: 0.1,
    });
  }

  public consummatedBy(player: Player): void {
    if (this.sfx) {
      this.add(SFX.createPooled(this.getX(), this.getY(), new Vector2(1, 1), this.sfx));
    }

    this.pickUpSoundFX.play();

    this.consummated = true;

    this.setVisible(false);
    this.setDirty(true);
  }

  public canBeConsummatedBy(entity: Entity): boolean {
    return entity instanceof Player;
  }
}

export default EffectPotion;
