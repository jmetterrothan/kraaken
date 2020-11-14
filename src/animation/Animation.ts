import Pool from "@src/shared/utility/Pool";

import { IKeyFrame } from "@shared/models/animation.model";

interface IAnimationMetadata {
  sprite: string;
  name: string;
  loop: boolean;
  keyframes: IKeyFrame[];
}

class Animation {
  public static pools: Map<string, Pool<Animation>> = new Map();
  public static instances: Map<string, Animation> = new Map();

  public static create(metadata: IAnimationMetadata): Animation {
    const usePool = !metadata.name.startsWith("coin");

    if (usePool) {
      if (!Animation.pools.has(metadata.name)) {
        Animation.pools.set(metadata.name, new Pool<Animation>());
      }

      const pool = Animation.pools.get(metadata.name);

      const animation = pool.borrow();
      if (animation) {
        return animation;
      }

      return new Animation(metadata);
    } else {
      if (!Animation.instances.has(metadata.name)) {
        Animation.instances.set(metadata.name, new Animation(metadata));
      }

      return Animation.instances.get(metadata.name);
    }
  }

  public static destroy(animation: Animation): void {
    const usePool = !animation.name.startsWith("coin");

    if (usePool) {
      if (Animation.pools.has(animation.name)) {
        animation.reset();

        const pool = Animation.pools.get(animation.name);
        pool.release(animation);
      }
    }
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

  public constructor({ sprite, name, loop, keyframes }: IAnimationMetadata) {
    this.sprite = sprite;
    this.name = name;
    this.loop = loop;
    this.keyframes = keyframes;

    this.paused = false;

    this.time = -1; // current time
    this.freezeTime = -1;
    this.played = 0; // times played
    this.index = 0; // current frame
  }

  public pause(): void {
    this.paused = true;
    this.freezeTime = window.performance.now();
  }

  public resume(): void {
    this.paused = false;

    if (this.freezeTime !== -1) {
      this.time += this.freezeTime - this.time;
    }
  }

  public update(): void {
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
          this.index = 0;
          this.played++;
        }

        this.time = now + this.keyframes[this.index].duration;
      }
    }
  }

  public reset(): void {
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

  public get duration(): number {
    return this.keyframes.reduce((value, current) => value + current.duration, 0);
  }

  public get frame(): IKeyFrame {
    return this.keyframes[this.index];
  }
}

export default Animation;
