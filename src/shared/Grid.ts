import { vec2 } from "gl-matrix";
import { configSvc } from "@src/shared/services/ConfigService";
import { mat3, vec4 } from "gl-matrix";

import Material from "@src/animation/Material";

import { gl } from "@src/Game";

import WebGL2H from "@src/shared/utility/WebGL2H";

import { IAttributes, IUniforms } from "@src/shared/models/sprite.model";

import vsObject from "@src/assets/shaders/grid.vs.glsl?raw";
import fsSprite from "@src/assets/shaders/grid.fs.glsl?raw";
import Vector2 from "./math/Vector2";
import { clamp } from "./utility/MathHelpers";

class Grid {
  private material: Material = new Material(vsObject, fsSprite);

  private vao: WebGLVertexArrayObject = gl.createVertexArray()!;
  private vbo: WebGLBuffer = gl.createBuffer()!;
  private ibo: WebGLBuffer = gl.createBuffer()!;

  private transform: mat3;

  private readonly nbCols: number;
  private readonly nbRows: number;
  private readonly width: number;
  private readonly height: number;
  private readonly tileSize: vec2;

  private cursorPosition: Vector2;
  private selectionStart: Vector2 | null;
  private selectionEnd: Vector2 | null;

  private color: vec4;
  private selectionColor: vec4;

  private attributes: IAttributes = {
    a_position: gl.getAttribLocation(this.material.program, "a_position"),
  };

  private uniforms: IUniforms = {
    u_projection: { type: "Matrix3fv", value: undefined, location: null },
    u_view: { type: "Matrix3fv", value: undefined, location: null },
    u_model: { type: "Matrix3fv", value: undefined, location: null },
    u_color: { type: "4fv", value: undefined, location: null },
    u_selection_color: { type: "4fv", value: undefined, location: null },
    u_scale: { type: "1f", value: undefined, location: null },
    u_tilesize: { type: "2fv", value: undefined, location: null },
    u_offset: { type: "2fv", value: undefined, location: null },
    u_show_selection: { type: "1i", value: false, location: null },
    u_selection_min: { type: "2fv", value: undefined, location: null },
    u_selection_max: { type: "2fv", value: undefined, location: null },
  };

  private loaded: boolean;

  public constructor(nbCols: number, nbRows: number, tileSize: number, c: vec4, ac: vec4) {
    this.transform = mat3.create();

    this.nbCols = nbCols;
    this.nbRows = nbRows;
    this.width = nbCols * tileSize;
    this.height = nbRows * tileSize;
    this.tileSize = [tileSize, tileSize];

    this.cursorPosition = new Vector2(0, 0);
    this.selectionStart = null;
    this.selectionEnd = null;

    this.color = c;
    this.selectionColor = ac;

    this.loaded = false;
  }

  public async init() {
    for (const key in this.uniforms) {
      if (this.uniforms[key]) {
        this.uniforms[key].location = gl.getUniformLocation(this.material.program, key);
      }
    }

    this.setup();
  }

  public use(): void {
    gl.useProgram(this.material.program);
    gl.bindVertexArray(this.vao);
  }

  public render(projectionMatrix: mat3, viewMatrix: mat3, offset: vec2): void {
    if (this.loaded) {
      this.setUniform("u_projection", projectionMatrix);
      this.setUniform("u_view", viewMatrix);
      this.setUniform("u_model", this.transform);
      this.setUniform("u_color", this.color);
      this.setUniform("u_scale", configSvc.scale);
      this.setUniform("u_tilesize", this.tileSize);
      this.setUniform("u_offset", offset);
      this.setUniform("u_show_selection", true);
      this.setUniform("u_selection_min", this.selectionMin);
      this.setUniform("u_selection_max", this.selectionMax);
      this.setUniform("u_selection_color", this.selectionColor);

      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }
  }

  private setUniform(key: string, value: any) {
    this.uniforms[key].value = value;
    WebGL2H.setUniform(gl, this.uniforms[key]);
  }

  private setup() {
    gl.useProgram(this.material.program);

    gl.bindVertexArray(this.vao);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, WebGL2H.createQuadVertices(0, 0, this.width, this.height), gl.STATIC_DRAW);

    gl.enableVertexAttribArray(this.attributes.a_position);
    gl.vertexAttribPointer(this.attributes.a_position, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([3, 2, 1, 3, 1, 0]), gl.STATIC_DRAW);

    gl.bindVertexArray(null);

    this.loaded = true;
  }

  public dispose(): void {
    gl.deleteBuffer(this.vbo);
    gl.deleteBuffer(this.ibo);
    gl.deleteVertexArray(this.vao);
  }

  public setCursorPosition(position: Vector2): void {
    this.cursorPosition = position.clone();
  }

  public beginSelection(position: Vector2): void {
    this.selectionStart = position.clone();
    this.selectionEnd = position.clone();
  }

  public updateSelection(position: Vector2): void {
    if (!this.selectionStart) {
      return;
    }
    this.selectionEnd = position.clone();
  }

  public endSelection(): void {
    this.selectionEnd = null;
    this.selectionStart = null;
  }

  public get selectionMin(): vec2 {
    const start = this.selectionStart ?? this.cursorPosition;
    const end = this.selectionEnd ?? start;

    const minX = Math.min(start.x, end.x);
    const minY = Math.min(start.y, end.y);

    return this.coordToIndex(minX, minY);
  }

  public get selectionMax(): vec2 {
    const start = this.selectionStart ?? this.cursorPosition;
    const end = this.selectionEnd ?? start;

    const maxX = Math.max(start.x, end.x);
    const maxY = Math.max(start.y, end.y);

    return this.coordToIndex(maxX, maxY);
  }

  public get selection(): Vector2[] {
    const min = this.selectionMin;
    const max = this.selectionMax;

    const a = [];

    for (let r = min[1]; r <= max[1]; r++) {
      for (let c = min[0]; c <= max[0]; c++) {
        a.push(new Vector2(c * this.tileSize[0], r * this.tileSize[1]));
      }
    }
    return a;
  }

  public coordToIndex(x: number, y: number): vec2 {
    return [clamp(Math.floor(x / this.tileSize[0]), 0, this.nbCols - 1), clamp(Math.floor(y / this.tileSize[1]), 0, this.nbRows - 1)];
  }
}

export default Grid;
