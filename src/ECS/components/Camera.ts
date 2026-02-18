import { mat3 } from "gl-matrix";

import { Entity, Component } from "@src/ECS";
import { Position } from "@src/ECS/components";

import Box2 from "@src/shared/math/Box2";
import Vector2 from "@src/shared/math/Vector2";

import { configSvc } from "@src/shared/services/ConfigService";
import Box2Helper from "@src/shared/helper/Box2Helper";

interface ICameraMetadata {
  smoothing?: number;
  lookAheadMaxPx?: number;
  lookAheadVelToPx?: number;
  lookAheadSmoothing?: number;
  clampSmoothing?: number;
  deadzoneWFrac?: number;
  deadzoneHFrac?: number;
}

type IShake = { t: number; dur: number; amp: number; freq: number; px: number; phx: number; phy: number };

export class CameraShake {
  private shakes: IShake[] = [];

  /** Start a micro shake: px = peak amplitude in pixels, ms = duration */
  shakeOnce(px: number, ms: number, freqHz = 35): void {
    const dur = Math.max(1, ms) / 1000;
    this.shakes.push({
      t: 0,
      dur,
      amp: px,
      freq: freqHz,
      px,
      phx: Math.random() * Math.PI * 2,
      phy: Math.random() * Math.PI * 2,
    });
  }

  update(dt: number): { xPx: number; yPx: number } {
    let x = 0,
      y = 0;

    for (let i = this.shakes.length - 1; i >= 0; i--) {
      const shake = this.shakes[i];
      shake.t += dt;

      const left = Math.max(0, shake.dur - shake.t);
      if (left <= 0) {
        this.shakes.splice(i, 1);
        continue;
      }

      const p = left / shake.dur;
      const amp = shake.amp * p * p;
      const w = shake.freq * Math.PI * 2;

      x += Math.sin(shake.t * w + shake.phx) * amp;
      y += Math.sin(shake.t * w + shake.phy) * amp;
    }

    const max = 10;

    return { xPx: Math.max(-max, Math.min(x, max)), yPx: Math.max(-max, Math.min(y, max)) };
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

  private _deadzoneWidth: number;
  private _deadzoneHeight: number;

  public deadzoneBox: Box2;
  public deadzoneHelper: Box2Helper;

  public constructor({ smoothing, lookAheadMaxPx, lookAheadVelToPx, lookAheadSmoothing, clampSmoothing, deadzoneWFrac, deadzoneHFrac }: ICameraMetadata) {
    this.smoothing = smoothing ?? 0.1;
    this.lookAheadMaxPx = lookAheadMaxPx ?? 0;
    this.lookAheadVelToPx = lookAheadVelToPx ?? 0;
    this.lookAheadSmoothing = lookAheadSmoothing ?? 0;
    this.clampSmoothing = clampSmoothing ?? 0;
    this.deadzoneWFrac = deadzoneWFrac ?? 0;
    this.deadzoneHFrac = deadzoneHFrac ?? 0;

    this.shake = new CameraShake();

    this.deadzoneBox = new Box2();
    this.deadzoneHelper = new Box2Helper(this.deadzoneBox, [0.2, 1.0, 0.2, 1.0]);

    this.deadzoneHelper.init();
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

  public renderDebug(projectionMatrix: mat3, viewMatrix: mat3, _alpha: number): void {
    // If viewBox is world-space camera rect:
    const vw = this.viewBox.width;
    const vh = this.viewBox.height;

    const dzW = vw * this.deadzoneWFrac;
    const dzH = vh * this.deadzoneHFrac;

    const x1 = this.viewBox.x1 + (vw - dzW) * 0.5;
    const y1 = this.viewBox.y1 + (vh - dzH) * 0.5;

    if (dzW !== this._deadzoneWidth || dzH !== this._deadzoneHeight) {
      this.deadzoneHelper.resize(dzW, dzH);

      this._deadzoneWidth = dzW;
      this._deadzoneHeight = dzH;
    }

    // Update Box2 (world coords)
    this.deadzoneBox.setMin(x1, y1);
    this.deadzoneBox.setMax(x1 + dzW, y1 + dzH);

    const model = mat3.create();
    mat3.fromTranslation(model, [this.deadzoneBox.x1, this.deadzoneBox.y1]);

    this.deadzoneHelper.use();
    this.deadzoneHelper.render(projectionMatrix, viewMatrix, model);
  }

  public toString(): string {
    return Camera.COMPONENT_TYPE;
  }
}
