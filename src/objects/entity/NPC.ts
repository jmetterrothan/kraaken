import { mat3 } from 'gl-matrix';

import Entity from '@src/objects/entity/Entity';

class NPC extends Entity {
  protected updateModelMatrix() {
    const offset = this.animation.getOffset();

    // correction accounting for bbox beeing at the bottom of the tile
    if (this.bbox) {
      offset.y -= (this.animation.getHeight() - this.bbox.getHeight()) / 2;
    }

    this.modelMatrix = mat3.fromTranslation(mat3.create(), this.getPosition().add(offset).toGlArray());
  }
}

export default NPC;
