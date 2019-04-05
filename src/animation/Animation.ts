import Sprite from '@src/animation/Sprite';

import { IAnimation, IAnimationFrame } from '@shared/models/animation.model';

class Animation
{
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

  constructor(name: string, data: IAnimation) {
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

  update() {
    if (!this.active) { return; }

    const now = window.performance.now();

    if (this.time === -1) {
      this.frame = 0;
      this.played = 0;
      this.freezeTime = -1;

      this.time = now + this.keyframes[0].duration;
    }

    if (this.loop || this.played == 0) {
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

  pause() {
    this.paused = true;
    this.freezeTime = window.performance.now();
  }

  resume() {
    this.paused = false;

    if (this.freezeTime !== -1) {
        this.time += this.freezeTime - this.time;
    }
  }

  reset() {
    this.time = -1;
  }

  playedOnce() {
    return this.played > 0;
  }
  
  getDuration() {
    return this.keyframes.reduce((value, current) => value + current.duration, 0);
  }

  render(world: any, transform: any, position: any, orientation: number) {
    // flickering effect
    const flicker = this.flickering && Math.floor(window.performance.now() / this.flickeringSpeed) % 2;
    const renderable = this.loop || !this.playedOnce();

    if (this.active && !flicker && renderable) {
        this.sprite.render(world, transform, position, this.keyframes[this.frame].row, this.keyframes[this.frame].col, orientation);
    }
  }

  toString() {
    return this.name;
  }
}

export default Animation;