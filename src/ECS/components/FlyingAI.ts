import World  from '@src/world/World';

import Entity  from '@src/ECS/Entity';
import Component from "@src/ECS/Component";
import { Position } from '@src/ECS/components';
import { POSITION_COMPONENT, FLYING_AI_COMPONENT } from "@src/ECS/types";

const MAX_DETECTION_DISTANCE = 250;
const RAYCAST_STEPS_NB = 32;

export class FlyingAI implements Component {
  public readonly type: symbol = FLYING_AI_COMPONENT;

  public target: Entity;

  public follow(entity: Entity): void {
    this.target = entity;
  }

  public unfollow(): void {
    this.target = undefined;
  }

  public hasTarget(target: Entity): boolean {
    return this.target === target;
  }

  public canSeeObject(world: World, entity: Entity): boolean {
    if (this.target) {
      const position = entity.getComponent<Position>(POSITION_COMPONENT);
      const targetPos = this.target.getComponent<Position>(POSITION_COMPONENT);
  
      const temp = position.clone();

      if (targetPos.distanceTo(temp) > MAX_DETECTION_DISTANCE) {
        return false;
      }

      const step = targetPos.clone().sub(temp).divideScalar(RAYCAST_STEPS_NB);
  
      // raycast
      for (let i = 0, n = RAYCAST_STEPS_NB; i < n; i++) {
        const tile = world.tileMap.getTileAtCoords(temp.x, temp.y);

        if (!tile) {
          continue;
        }

        if (tile.hasCollision()) {
          return false;
        }
  
        temp.add(step);
      }

      return true;
    }
   
    return false;
  }

  public toString(): string {
    return `Flying AI`;
  }
}
