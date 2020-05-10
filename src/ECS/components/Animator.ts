import Entity from "@src/ECS/Entity";
import Component from "@src/ECS/Component";

import { ANIMATOR_COMPONENT } from "@src/ECS/types";

import Animation from "@src/animation/Animation";

import { IAnimation } from "@src/shared/models/animation.model";

export interface IAnimatorMetadata {
  defaultKey?: string;
  list?: Record<string, IAnimation>;
}

export class Animator implements Component {
  public readonly type: symbol = ANIMATOR_COMPONENT;

  public readonly list: Map<string, Animation> = new Map();

  public currentKey: string;
  public previousKey: string = undefined;

  public constructor({ list, defaultKey }: IAnimatorMetadata) {
    this.currentKey = defaultKey ?? "idle";

    // convert animation parameters in Animation objects
    for (const name of Object.keys(list ?? {})) {
      this.list.set(name, new Animation({ name, ...list[name] }));
    }
  }

  public update(entity: Entity): string {
    return "idle";
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
