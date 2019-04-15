import Entity from '@src/objects/Entity';

import { IEntityData } from '@src/shared/models/entity.model';

class Player extends Entity {
  constructor(x: number, y: number, data: IEntityData) {
    super(x, y, data);
  }

  public handleKeyboardInput(key, active) {
    switch (key) {
      case 'ArrowLeft':
        this.left = active;
        break;

      case 'ArrowRight':
        this.right = active;
        break;

      case 'ArrowUp':
        this.up = active;
        break;

      case 'ArrowDown':
        this.down = active;
        break;
    }
  }
}

export default Player;
