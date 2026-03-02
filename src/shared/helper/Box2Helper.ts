import { mat3, vec4 } from "gl-matrix";

import WebGL2H from "@src/shared/utility/WebGL2H";
import Material from "@src/animation/Material";

import Box2 from "@src/shared/math/Box2";

import { gl } from "@src/Game";

import { IAttributes, IUniforms } from "@src/shared/models/sprite.model";

import fsBox from "@src/assets/shaders/box.fs.glsl?raw";
import vsBox from "@src/assets/shaders/box.vs.glsl?raw";

import { configSvc } from "../services/ConfigService";

class Box2Helper {
  private colorMaterial: Material = new Material(vsBox, fsBox);

  private vao: WebGLVertexArrayObject = gl.createVertexArray()!;
  private vbo: WebGLBuffer = gl.createBuffer();
  private ibo: WebGLBuffer = gl.createBuffer();

  private _width: number;
  private _height: number;

  public readonly bbox: Box2;
  public readonly defaultOutlineColor: vec4;
  public readonly defaultOutlineThickness: number;
  public readonly defaultFillColor: vec4;

  public outlineColor: vec4;
  public outlineThickness: number;

  public fillColor: vec4;

  public constructor(bbox: Box2, outlineColor: vec4, fillColor: vec4 = [0, 0, 0, 0], thickness: number = 0.5) {
    this.bbox = bbox;
    this.defaultOutlineColor = outlineColor;
    this.defaultFillColor = fillColor;
    this.defaultOutlineThickness = thickness;

    this.outlineColor = outlineColor;
    this.fillColor = fillColor;
    this.outlineThickness = thickness;

    this._width = 0;
    this._height = 0;
  }

  private attributes: IAttributes = {
    a_position: gl.getAttribLocation(this.colorMaterial.program, "a_position"),
  };

  private uniforms: IUniforms = {
    u_projection: { type: "Matrix3fv", value: undefined, location: null },
    u_view: { type: "Matrix3fv", value: undefined, location: null },
    u_model: { type: "Matrix3fv", value: undefined, location: null },
    u_outline_thickness: { type: "1f", value: undefined, location: null },
    u_outline_color: { type: "4fv", value: undefined, location: null },
    u_fill_color: { type: "4fv", value: undefined, location: null },
    u_size: { type: "2fv", value: undefined, location: null },
  };

  public async init(): Promise<void> {
    for (const key in this.uniforms) {
      if (this.uniforms[key]) {
        this.uniforms[key].location = gl.getUniformLocation(this.colorMaterial.program, key);
      }
    }

    this.setup();
  }

  public use(): void {
    gl.useProgram(this.colorMaterial.program);

    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
  }

  public render(projectionMatrix: mat3, viewMatrix: mat3, modelMatrix: mat3): void {
    this.setUniform("u_projection", projectionMatrix);
    this.setUniform("u_view", viewMatrix);
    this.setUniform("u_model", modelMatrix);

    this.setUniform("u_size", [this.bbox.width, this.bbox.height]);

    this.setUniform("u_outline_color", this.outlineColor);
    this.setUniform("u_outline_thickness", this.outlineThickness * configSvc.scale);

    this.setUniform("u_fill_color", this.fillColor);

    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  }

  private setUniform(key: string, value: any) {
    this.uniforms[key].value = value;
    WebGL2H.setUniform(gl, this.uniforms[key]);
  }

  public resize(width: number, height: number): void {
    if (width !== this._width || height !== this._height) {
      this._width = width;
      this._height = height;

      gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
      gl.bufferData(gl.ARRAY_BUFFER, WebGL2H.createQuadVertices(0, 0, width, height), gl.DYNAMIC_DRAW);
    }
  }

  private setup() {
    gl.useProgram(this.colorMaterial.program);

    gl.bindVertexArray(this.vao);

    // unit quad (0..1)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, WebGL2H.createQuadVertices(0, 0, this.bbox.width, this.bbox.height), gl.STATIC_DRAW);

    gl.enableVertexAttribArray(this.attributes.a_position);
    gl.vertexAttribPointer(this.attributes.a_position, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
    // keep same index order you already use
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([3, 2, 1, 3, 1, 0]), gl.STATIC_DRAW);

    gl.bindVertexArray(null);
  }
}

export default Box2Helper;
