import { SPRITE_COMPONENT, POSITION_COMPONENT, BOUNDING_BOX_COMPONENT, RIGID_BODY_COMPONENT, PLAYER_INPUT_COMPONENT, PLAYER_MOVEMENT_COMPONENT, ANIMATOR_COMPONENT, HEALTH_COMPONENT } from "@src/objects/ECS/types";
import { PlayerMovement, PlayerInput, Animator, BoundingBox, RigidBody, Position, Sprite, Health } from "@src/objects/ECS/components";

class ComponentFactory {
  public static create(name: string, metadata: any) {
    switch (name) {
      case POSITION_COMPONENT:
        return new Position(metadata);
      case BOUNDING_BOX_COMPONENT:
        return new BoundingBox(metadata);
      case PLAYER_MOVEMENT_COMPONENT:
        return new PlayerMovement(metadata);
      case PLAYER_INPUT_COMPONENT:
        return new PlayerInput();
      case ANIMATOR_COMPONENT:
        return new Animator(metadata);
      case SPRITE_COMPONENT:
        return new Sprite(metadata);
      case HEALTH_COMPONENT:
        return new Health(metadata);
      case RIGID_BODY_COMPONENT:
        return new RigidBody(metadata);
      default:
        throw new Error(`Unknown component name "${name}"`);
    }
  }
}

export default ComponentFactory;
