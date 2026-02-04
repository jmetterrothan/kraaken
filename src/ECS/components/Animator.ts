import { Entity, Component } from "@src/ECS";

import Animation, { AnimationOptimization } from "@src/animation/Animation";
import World from "@src/world/World";

import { IAnimation } from "@src/shared/models/animation.model";

export interface IAnimatorMetadata {
  optimization: AnimationOptimization;
  defaultKey: string;
  list?: Record<string, IAnimation>;
}

export class Animator implements Component {
  public static COMPONENT_TYPE = "animator";

  public readonly list: Map<string, Animation> = new Map();

  public defaultKey: string;
  public currentKey: string;
  public previousKey: string | null = null;

  public constructor({ optimization = "pool", list = {}, defaultKey }: IAnimatorMetadata) {
    this.defaultKey = defaultKey;
    this.currentKey = this.defaultKey;

    // convert animation parameters in Animation objects
    for (const [name, metadata] of Object.entries(list)) {
      const animation = Animation.create(optimization, { name, ...metadata });

      if (!animation) {
        throw new Error(`Could not instantiate animation "${name}"`);
      }

      this.list.set(name, animation);
    }

    if (!defaultKey || !this.hasAnimation(defaultKey)) {
      throw new Error(`Missing default animation "${defaultKey}"`);
    }
  }

  public update(_world: World, _entity: Entity): string {
    return this.currentKey;
  }

  public hasAnimation(name: string): boolean {
    return this.list.has(name);
  }

  public get animation(): Animation {
    if (!this.hasAnimation(this.currentKey)) {
      console.warn(`Missing animation "${this.currentKey}"`);
      return this.list.get(this.defaultKey)!;
    }
    return this.list.get(this.currentKey)!;
  }

  public toString(): string {
    return Animator.COMPONENT_TYPE;
  }
}
