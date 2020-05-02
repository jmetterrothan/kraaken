import Character from "@src/objects/entity/Character";
import Vector2 from "@shared/math/Vector2";
import Entity from "@src/objects/entity/Entity";
import World from "@src/world/World";

import { IConsummable, IConsummableBehaviour } from "@shared/models/consummable.model";

abstract class Consummable extends Entity implements IConsummableBehaviour {
  protected sfx: string;
  protected consummated: boolean;

  constructor(uuid: string, x: number, y: number, direction: Vector2, data: IConsummable) {
    super(uuid, x, y, direction, data);
    this.sfx = data.metadata.sfx || undefined;
  }

  public update(world: World, delta: number) {
    super.update(world, delta);

    if (!this.consummated) {
      const characters = world.getActiveCharacters();

      for (const character of characters) {
        if (character.isDirty() || character.isDead() || !this.canBeConsummatedBy(character)) {
          continue;
        }

        if (character.collideWith(this)) {
          this.consummatedBy(character);
          break;
        }
      }
    }
  }

  public abstract consummatedBy(character: Character): void;
  public abstract canBeConsummatedBy(character: Character): boolean;
}

export default Consummable;
