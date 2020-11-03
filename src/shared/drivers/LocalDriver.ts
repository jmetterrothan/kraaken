import AbstractDriver from '@src/shared/drivers/AbstractDriver';

import { IWorldBlueprint } from '@shared/models/world.model';
import { ILevelBlueprint } from '@shared/models/world.model';

class SaveError extends Error {
  constructor (message: string) {
    super();

    this.message = message;
    this.name = "SaveError";
  }
}

class LocalDriver extends AbstractDriver {
  public async load(id: string): Promise<IWorldBlueprint> {
    const { default: level } = await import(`@src/data/${id}/level.json`);
    const { default: entities } = await import(`@src/data/${id}/entities.json`);
    const { default: resources } = await import(`@src/data/${id}/resources.json`);

    return { level, entities, sprites: resources.sprites, sounds: resources.sounds };
  }

  public async save(id: string, levelData: Partial<ILevelBlueprint>): Promise<void> {
    alert('[Failed] Save not yet implemented on local driver');
    throw new SaveError('Save not implemented on local driver');
  }
}

export default LocalDriver;
