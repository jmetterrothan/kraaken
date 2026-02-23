import { Component } from "@src/ECS";
import * as Components from "@src/ECS/components";

class ComponentFactory {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public static create(type: string, metadata: any): Component {
    switch (type) {
      case "camera":
        return new Components.Camera(metadata);
      case "position":
        return new Components.Position(metadata);
      case "bounding_box":
        return new Components.BoundingBox(metadata);
      case "movement":
        return new Components.Movement(metadata);
      case "player_input":
        return new Components.PlayerInput();
      case "animator":
        switch (metadata.type) {
          case "player_animator":
            return new Components.PlayerAnimator(metadata);
          case "enemy_animator":
            return new Components.EnemyAnimator(metadata);
          default:
            return new Components.Animator(metadata);
        }
      case "sprite":
        return new Components.Sprite(metadata);
      case "health":
        return new Components.Health(metadata);
      case "rigid_body":
        return new Components.RigidBody(metadata);
      case "health_modifier":
        return new Components.HealthModifier(metadata);
      case "ammo_modifier":
        return new Components.AmmoModifier(metadata);
      case "collectible":
        return new Components.Collectible(metadata);
      case "player_combat":
        return new Components.PlayerCombat();
      case "basic_input":
        return new Components.BasicInput();
      case "placeable":
        return new Components.Placeable();
      case "projectile":
        return new Components.Projectile(metadata);
      case "flying_ai":
        return new Components.FlyingAI(metadata);
      case "collider":
        return new Components.Collider(metadata);
      case "damage_event":
        return new Components.DamageEvent(metadata);
      case "explosion":
        return new Components.Explosion(metadata);
      case "fuse":
        return new Components.Fuse(metadata);
      case "loot":
        return new Components.Loot(metadata);
      case "death_event":
        return new Components.DeathEvent(metadata);
      case "patrol_ai":
        return new Components.PatrolAI(metadata);
      default:
        throw new Error(`Unknown component name "${name}"`);
    }
  }
}

export default ComponentFactory;
