import Pool from "@src/shared/utility/Pool";

import { IKeyFrame } from "@src/shared/models/animation.model";

interface IAnimationMetadata {
  sprite: string;
  name: string;
  loop: boolean;
  keyframes: IKeyFrame[];
}

export type AnimationOptimization = "singleton" | "pool" | "none";

class Animation {
  public static pools: Map<string, Pool<Animation>> = new Map();
  public static instances: Map<string, Animation> = new Map();

  public static create(optimization: AnimationOptimization, metadata: IAnimationMetadata): Animation {
    if (optimization === "singleton") {
      if (!Animation.instances.has(metadata.name)) {
        Animation.instances.set(metadata.name, new Animation(metadata));
      }

      return Animation.instances.get(metadata.name)!;
    }

    if (optimization === "pool") {
      if (!Animation.pools.has(metadata.name)) {
        Animation.pools.set(metadata.name, new Pool<Animation>());
      }

      const pool = Animation.pools.get(metadata.name);

      const animation = pool?.borrow();
      if (animation) {
        animation.reset();
        return animation;
      }
    }

    return new Animation(metadata);
  }

  public static destroy(animation: Animation): void {
    const usePool = Animation.shouldUsePool(animation.name);

    if (usePool) {
      if (Animation.pools.has(animation.name)) {
        animation.reset();

        const pool = Animation.pools.get(animation.name);

        if (pool) {
          pool.release(animation);
        }
      }
    }
  }

  public static shouldUsePool(name: string): boolean {
    return !name.startsWith("coin");
  }

  public readonly sprite: string;
  public readonly name: string;
  public readonly keyframes: IKeyFrame[];
  public readonly loop: boolean;

  public paused: boolean;

  public time: number;
  public freezeTime: number;
  public played: number;
  public index: number;
  public readonly duration: number = 0;

  public constructor({ sprite, name, loop, keyframes }: IAnimationMetadata) {
    this.sprite = sprite;
    this.name = name;
    this.loop = loop;
    this.keyframes = keyframes;
    this.duration = this.keyframes.reduce((value, current) => value + current.duration, 0);

    this.paused = false;

    this.time = -1; // current time
    this.freezeTime = -1;
    this.played = 0; // times played
    this.index = 0; // current frame
  }

  public pause(): void {
    if (!this.paused) {
      this.paused = true;
      this.freezeTime = window.performance.now();
    }
  }

  public resume(): void {
    if (this.paused) {
      this.paused = false;

      if (this.freezeTime !== -1) {
        const pausedFor = window.performance.now() - this.freezeTime;
        this.time += pausedFor;
        this.freezeTime = -1;
      }
    }
  }

  public update(_delta: number): void {
    const now = window.performance.now();

    if (this.time === -1) {
      this.index = 0;
      this.played = 0;
      this.freezeTime = -1;

      this.time = now + this.keyframes[0].duration;
    }

    if (this.loop || this.played === 0) {
      if (!this.paused && now >= this.time) {
        this.index++;

        if (this.index >= this.keyframes.length) {
          this.played++;
          if (this.loop) {
            this.index = 0;
          } else {
            this.index = this.keyframes.length - 1;
          }
        }

        this.time = now + this.keyframes[this.index].duration;
      }
    }
  }

  public reset(): void {
    this.paused = false;

    this.time = -1;
    this.freezeTime = -1;
    this.played = 0;
    this.index = 0;
  }

  public toString(): string {
    return `Animation - ${this.name} [${this.index}]`;
  }

  public get playedOnce(): boolean {
    return this.played > 0;
  }

  public get frame(): IKeyFrame {
    return this.keyframes[this.index];
  }
}

export default Animation;
