import { IKeyFrame } from "@shared/models/animation.model";

interface IAnimationMetadata {
  name: string;
  loop: boolean;
  keyframes: IKeyFrame[];
}

class Animation {
  public readonly name: string;
  public readonly keyframes: IKeyFrame[];
  public readonly loop: boolean;

  public paused: boolean;

  public time: number;
  public freezeTime: number;
  public played: number;
  public index: number;

  public constructor({ name, loop, keyframes }: IAnimationMetadata) {
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

  public update() {
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
