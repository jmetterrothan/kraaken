import Entity from '@src/objects/entity/Entity';

export interface IConsummable {
  consummatedBy(entity: Entity): void;
}
