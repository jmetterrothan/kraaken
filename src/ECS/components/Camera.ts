import { mat3 } from "gl-matrix";

import { Entity, Component } from "@src/ECS";
import { Position } from "@src/ECS/components";

import Box2 from "@src/shared/math/Box2";
import Vector2 from "@src/shared/math/Vector2";

import { configSvc } from "@src/shared/services/ConfigService";

interface ICameraMetadata {
  smoothing?: number;
  lookAheadMaxPx?: number;
  lookAheadVelToPx?: number;
  lookAheadSmoothing?: number;
  clampSmoothing?: number;
  deadzoneWFrac?: number;
  deadzoneHFrac?: number;
}

export class CameraShake {
  private t = 0;

  private durationLeft = 0;
  private durationTotal = 0;

  private maxPx = 0;
  private freqHz = 35;

  private phaseX = 0;
  private phaseY = 0;

  /** Start a micro shake: px = peak amplitude in pixels, ms = duration */
  shakeOnce(px: number, ms: number, freqHz: number): void {
    const dur = Math.max(1, ms) / 1000;

    // If you call shakeOnce repeatedly (e.g., rapid shots), keep the strongest/longest.
    this.maxPx = Math.max(this.maxPx, px);
    this.freqHz = freqHz;

    this.durationTotal = Math.max(this.durationTotal, dur);
    this.durationLeft = Math.max(this.durationLeft, dur);

    // Reset time + randomize phases (starts at 0 offset to avoid a "snap")
    this.t = 0;
    this.phaseX = Math.random() * Math.PI * 2;
    this.phaseY = Math.random() * Math.PI * 2;
  }

  /** Returns camera offset in PIXELS */
  update(deltaSeconds: number): { xPx: number; yPx: number } {
    if (this.durationLeft <= 0) return { xPx: 0, yPx: 0 };

    this.durationLeft = Math.max(0, this.durationLeft - deltaSeconds);
    this.t += deltaSeconds;

    // nice micro feel: quadratic falloff
    const p = this.durationTotal > 0 ? this.durationLeft / this.durationTotal : 0;
    const amp = this.maxPx * p * p;

    const w = this.freqHz * Math.PI * 2;

    const xPx = Math.sin(this.t * w + this.phaseX) * amp;
    const yPx = Math.sin(this.t * w + this.phaseY) * amp;

    // when finished, clear amplitude so next shakeOnce can set it
    if (this.durationLeft <= 0) {
      this.maxPx = 0;
      this.durationTotal = 0;
    }

    return { xPx, yPx };
  }
}

export class Camera implements Component {
  public static COMPONENT_TYPE = "camera";

  public viewMatrix: mat3 = mat3.create();
  public viewMatrixInverse: mat3 = mat3.create();
  public previousPosition: Vector2 = new Vector2();

  public shouldUpdateProjectionMatrix = true;

  public viewBox: Box2 = new Box2();

  public target: Entity | null = null;
  public boundaries: Box2 | null = null;

  public zoom: number = configSvc.scale;

  public shake: CameraShake;

  public readonly smoothing: number;

  public readonly lookAheadMaxPx; // max look-ahead in screen pixels
  public readonly lookAheadVelToPx; // velocity -> pixels multiplier (tune)
  public readonly lookAheadSmoothing; // 0..1 (like your smoothing)

  public readonly deadzoneWFrac; // % of screen width
  public readonly deadzoneHFrac; // % of screen height

  public readonly clampSmoothing; // 0..1, how softly we stick to bounds

  public lookAhead = Vector2.create(0, 0);

  public constructor({ smoothing, lookAheadMaxPx, lookAheadVelToPx, lookAheadSmoothing, clampSmoothing, deadzoneWFrac, deadzoneHFrac }: ICameraMetadata) {
    this.smoothing = smoothing ?? 0.1;
    this.lookAheadMaxPx = lookAheadMaxPx ?? 0;
    this.lookAheadVelToPx = lookAheadVelToPx ?? 0;
    this.lookAheadSmoothing = lookAheadSmoothing ?? 0;
    this.clampSmoothing = clampSmoothing ?? 0;
    this.deadzoneWFrac = deadzoneWFrac ?? 0;
    this.deadzoneHFrac = deadzoneHFrac ?? 0;

    this.shake = new CameraShake();
  }

  public clamp(position: Position): void {
    if (!this.boundaries) {
      return;
    }

    const halfW = configSvc.innerSize.w / 2;
    const halfH = configSvc.innerSize.h / 2;

    const x1 = this.boundaries.x1 + halfW;
    const x2 = this.boundaries.x2 - halfW;
    const y1 = this.boundaries.y1 + halfH;
    const y2 = this.boundaries.y2 - halfH;

    if (position.x < x1) {
      position.x = x1;
    }
    if (position.y < y1) {
      position.y = y1;
    }
    if (position.x > x2) {
      position.x = x2;
    }
    if (position.y > y2) {
      position.y = y2;
    }
  }

  /**
   * fix for texture bleeding by rounding the x, y components
   */
  public fixBleedingEdges(): void {
    this.viewMatrix[6] = Math.round(this.viewMatrix[6]);
    this.viewMatrix[7] = Math.round(this.viewMatrix[7]);
  }

  public follow(target: Entity): void {
    this.target = target;
  }

  public unfollow(): void {
    this.target = null;
  }

  public shakeOnce(px = 8, ms = 200, freqHz = 35): void {
    this.shake.shakeOnce(px, ms, freqHz);
  }

  public toString(): string {
    return Camera.COMPONENT_TYPE;
  }
}
