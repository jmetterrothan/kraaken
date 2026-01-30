import { Component, Entity } from "@src/ECS";

import World from "@src/world/World";

import SoundManager from "@src/animation/SoundManager";
import { Position } from "./Position";
import Vector2 from "@src/shared/math/Vector2";

export interface IConsummableMetadata {
  radius?: number;
  limit?: number;
  acceleration?: number;
  speed?: number;
  snappiness?: number;
  applyToEntityTypes?: string[];
  pickUpVFX?: string;
  pickUpSFX?: string;
}

export class Consummable extends Component {
  public static COMPONENT_TYPE = "consummable";

  public readonly applyToEntityTypes?: string[];
  public readonly radius: number;
  public readonly limit: number;
  public readonly acceleration: number;
  public readonly speed: number;
  public readonly snappiness: number;
  public readonly pickUpVFX: string | null = null;
  public readonly pickUpSFX?: Howl;

  public target: Entity | null = null;

  public consummated = false;
  public nbOfTimesConsummated = 0;

  public constructor(metadata: IConsummableMetadata = {}) {
    super();

    this.radius = metadata.radius ?? 0;
    this.limit = metadata.limit ?? 1;
    this.acceleration = metadata.acceleration ?? 0;
    this.speed = metadata.speed ?? 0;
    this.snappiness = metadata.snappiness ?? 0;
    this.applyToEntityTypes = metadata.applyToEntityTypes;

    this.pickUpVFX = metadata.pickUpVFX ?? null;

    if (metadata.pickUpSFX) {
      this.pickUpSFX = SoundManager.create(metadata.pickUpSFX, {
        volume: 0.1,
      });
    }
  }

  public consummatedBy(world: World, entity: Entity, at: Vector2 | null = null): void {
    this.nbOfTimesConsummated += 1;

    if (this.pickUpSFX) {
      this.pickUpSFX.play();
    }

    if (this.pickUpVFX) {
      const position = entity.getComponent(Position);
      world.playEffectOnceAt(this.pickUpVFX, { x: at?.x ?? position.x, y: at?.y ?? position.y });
    }
  }

  public canBeConsummatedBy(entity: Entity): boolean {
    if (this.limit !== -1 && this.nbOfTimesConsummated >= this.limit) {
      return false;
    }

    // ignore entities not affected by the modifier
    if (Array.isArray(this.applyToEntityTypes) && !this.applyToEntityTypes.includes(entity.type)) {
      return false;
    }
    return true;
  }

  public getComponentTypes(): string[] {
    return [];
  }

  public toString(): string {
    return Consummable.COMPONENT_TYPE;
  }
}
