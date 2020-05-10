import { HealthPotion, PlayerMovement, PlayerInput, Animator, BoundingBox, RigidBody, Position, Sprite, Health, PlayerAnimator, Collectible } from "@src/ECS/components";

class ComponentFactory {
  public static create(name: string, metadata: any) {
    switch (name) {
      case "position":
        return new Position(metadata);
      case "bounding_box":
        return new BoundingBox(metadata);
      case "player_movement":
        return new PlayerMovement(metadata);
      case "player_input":
        return new PlayerInput(metadata);
      case "player_animator":
        return new PlayerAnimator(metadata);
      case "animator":
        return new Animator(metadata);
      case "sprite":
        return new Sprite(metadata);
      case "health":
        return new Health(metadata);
      case "rigid_body":
        return new RigidBody(metadata);
      case "health_potion":
        return new HealthPotion(metadata);
      case "collectible":
        return new Collectible(metadata);
      default:
        throw new Error(`Unknown component name "${name}"`);
    }
  }
}

export default ComponentFactory;
