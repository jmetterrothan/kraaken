import Entity from "@src/ECS/Entity";
import Component from "@src/ECS/Component";

import { ANIMATOR_COMPONENT } from "@src/ECS/types";

import World from "@src/world/World";
import Animation from "@src/animation/Animation";

import { IAnimation } from "@src/shared/models/animation.model";

export interface IAnimatorMetadata {
  defaultKey: string;
  list?: Record<string, IAnimation>;
}

export class Animator implements Component {
  public readonly type: symbol = ANIMATOR_COMPONENT;

  public readonly list: Map<string, Animation> = new Map();

  public defaultKey: string;
  public currentKey: string;
  public previousKey: string = undefined;

  public constructor({ list, defaultKey }: IAnimatorMetadata) {
    this.defaultKey = defaultKey;
    this.currentKey = this.defaultKey;

    if (!this.currentKey) {
      throw new Error("Undefined default animation key");
    }

    // convert animation parameters in Animation objects
    for (const name of Object.keys(list ?? {})) {
      const animation = Animation.create({ name, ...list[name] });

      if (!animation) {
        throw new Error("Could not instanciate animation");
      }

      this.list.set(name, animation);
    }
  }

  public update(world: World, entity: Entity): string {
    return this.currentKey;
  }

  public hasAnimation(name: string): boolean {
    return this.list.has(name);
  }

  public toString(): string {
    return `Animation - ${this.animation.name}`;
  }

  public get animation(): Animation {
    if (!this.list.has(this.currentKey)) {
      throw new Error(`Undefined animation key`);
    }
    return this.list.get(this.currentKey);
  }
}
