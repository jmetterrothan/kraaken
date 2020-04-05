import { vec3, vec4 } from "gl-matrix";

import { IRGBAColorData } from "@src/shared/models/color.model";

class Color {
  public static fromRGBData(data: IRGBAColorData): Color {
    return new Color(data.r, data.g, data.b);
  }

  private v: vec4;

  constructor(r, g, b, a = 1) {
    this.v = vec4.fromValues(r, g, b, a);
  }

  get r(): number {
    return this.v[0];
  }
  set r(value: number) {
    this.v[0] = value;
  }

  get g(): number {
    return this.v[1];
  }
  set g(value: number) {
    this.v[1] = value;
  }

  get b(): number {
    return this.v[2];
  }
  set b(value: number) {
    this.v[2] = value;
  }

  get a(): number {
    return this.v[3];
  }
  set a(value: number) {
    this.v[3] = value;
  }

  public toVec3(): vec3 {
    return vec3.fromValues(this.r, this.g, this.b);
  }

  public toVec4(): vec4 {
    return this.v;
  }
}

export default Color;
