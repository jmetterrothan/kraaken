import Component from '@src/ECS/Component';

import { EditMode, HealthModifier, PlayerCombat, Fill, AmmoModifier, PlayerMovement, PlayerInput, Animator, BoundingBox, RigidBody, Position, Sprite, Health, PlayerAnimator, Collectible, BasicInput } from "@src/ECS/components";

class ComponentFactory {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public static create(name: string, metadata: any): Component {
    switch (name) {
      case "position":
        return new Position(metadata);
      case "bounding_box":
        return new BoundingBox(metadata);
      case "player_movement":
        return new PlayerMovement(metadata);
      case "player_input":
        return new PlayerInput();
      case "player_animator":
        return new PlayerAnimator(metadata);
      case "animator":
        return new Animator(metadata);
      case "sprite":
        return new Sprite(metadata);
      case "fill":
        return new Fill(metadata);
      case "health":
        return new Health(metadata);
      case "rigid_body":
        return new RigidBody(metadata);
      case "health_modifier":
        return new HealthModifier(metadata);
      case "ammo_modifier":
        return new AmmoModifier(metadata);
      case "collectible":
        return new Collectible(metadata);
      case "player_combat":
        return new PlayerCombat();
      case "basic_input":
        return new BasicInput();
      case "edit_mode":
        return new EditMode();
      default:
        throw new Error(`Unknown component name "${name}"`);
    }
  }
}

export default ComponentFactory;
