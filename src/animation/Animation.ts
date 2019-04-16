import { mat3 } from 'gl-matrix';

import Sprite from '@src/animation/Sprite';

import { IAnimationData, IAnimationFrame } from '@shared/models/animation.model';
import Vector2 from '@src/shared/math/Vector2';

class Animation {
  private name: string;
  private keyframes: IAnimationFrame[];
  private loop: boolean;

  private sprite: any;

  private active: boolean;
  private paused: boolean;

  private time: number;
  private freezeTime: number;
  private played: number;
  private frame: number;

  private flickering: boolean;
  private flickeringSpeed: number;

  constructor(name: string, data: IAnimationData) {
    this.name = name;
    this.loop = data.loop;
    this.keyframes = data.keyframes;

    this.sprite = Sprite.get(data.sprite);

    this.active = true;
    this.paused = false;

    this.time = -1; // current time
    this.freezeTime = -1;
    this.played = 0; // times played
    this.frame = 0; // current frame

    this.flickering = false;
    this.flickeringSpeed = 150;
  }

  public update() {
    if (!this.active) { return; }

    const now = window.performance.now();

    if (this.time === -1) {
      this.frame = 0;
      this.played = 0;
      this.freezeTime = -1;

      this.time = now + this.keyframes[0].duration;
    }

    if (this.loop || this.played === 0) {
      if (!this.paused && now >= this.time) {
        this.frame++;

        if (this.frame >= this.keyframes.length) {
          this.frame = 0;
          this.played++;
        }

        this.time = now + this.keyframes[this.frame].duration;
      }
    }
  }

  public pause() {
    this.paused = true;
    this.freezeTime = window.performance.now();
  }

  public resume() {
    this.paused = false;

    if (this.freezeTime !== -1) {
        this.time += this.freezeTime - this.time;
    }
  }

  public reset() {
    this.time = -1;
  }

  public playedOnce() {
    return this.played > 0;
  }

  public getDuration() {
    return this.keyframes.reduce((value, current) => value + current.duration, 0);
  }

  public render(viewProjectionMatrix: mat3, modelMatrix: mat3, direction: Vector2) {
    // flickering effect
    const flicker = this.flickering && Math.floor(window.performance.now() / this.flickeringSpeed) % 2;
    const renderable = this.loop || !this.playedOnce();

    if (this.active && !flicker && renderable) {
        this.sprite.render(viewProjectionMatrix, modelMatrix, this.keyframes[this.frame].row, this.keyframes[this.frame].col, direction);
    }
  }

  public toString() {
    return this.name;
  }
}

export default Animation;
