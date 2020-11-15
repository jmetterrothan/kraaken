import { RIGID_BODY_COMPONENT, FLYING_AI_COMPONENT, POSITION_COMPONENT } from "@src/ECS/types";
import { RigidBody, FlyingAI, Position } from '@src/ECS/components';
import System from "@src/ECS/System";

import Vector2 from '@shared/math/Vector2';

export class AISystem extends System {
  public constructor() {
    super([FLYING_AI_COMPONENT]);
  }

  execute(delta: number): void {
    const entities = this.world.getEntities(this.componentTypes);
    if (entities.length === 0) {
      return;
    }

    entities.forEach((entity) => {
      const ai = entity.getComponent<FlyingAI>(FLYING_AI_COMPONENT);

      if (!ai.target) {
        ai.follow(this.world.player);
      }

      // TODO: optimize / should update only a few times per second
      const visible = ai.canSeeObject(this.world, entity);

      if (visible) {
        const targetPos = ai.target.getComponent<Position>(POSITION_COMPONENT);
        
        const position = entity.getComponent<Position>(POSITION_COMPONENT);
        const rigidBody = entity.getComponent<RigidBody>(RIGID_BODY_COMPONENT);

        // orient the ai entity towards the target entity
        rigidBody.orientation.x = targetPos.x > position.x ? 1 : -1;

        // follow the target entity
        const dir = targetPos.clone().sub(position).normalize();
        const dist = position.distanceTo(targetPos);

        if (dist >= 80) {
          rigidBody.direction.x = dir.x;
          rigidBody.direction.y = dir.y;

          rigidBody.velocity.x += 4;
          rigidBody.velocity.y += 4;

          if (rigidBody.velocity.x > 96) {
            rigidBody.velocity.x = 96;
          }
          if (rigidBody.velocity.y > 96) {
            rigidBody.velocity.y = 96;
          }
        } else {
          rigidBody.velocity.x -= 4;
          if (rigidBody.velocity.x < 0) {
            rigidBody.velocity.x = 0;
          }

          rigidBody.velocity.y -= 4;
          if (rigidBody.velocity.y < 0) {
            rigidBody.velocity.y = 0;
          }
        }

        Vector2.destroy(dir);
      }
    });
  }
}
