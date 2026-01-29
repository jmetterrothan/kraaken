import { vec2 } from "gl-matrix";
import { configSvc } from "@src/shared/services/ConfigService";
import { mat3, vec4 } from "gl-matrix";

import Material from "@src/animation/Material";

import { gl } from "@src/Game";

import WebGL2H from "@src/shared/utility/WebGL2H";

import { IAttributes, IUniforms } from "@src/shared/models/sprite.model";

import vsObject from "@src/assets/shaders/grid.vs.glsl?raw";
import fsSprite from "@src/assets/shaders/grid.fs.glsl?raw";

class Grid {
  private material: Material = new Material(vsObject, fsSprite);

  private vao: WebGLVertexArrayObject = gl.createVertexArray()!;
  private vbo: WebGLBuffer = gl.createBuffer()!;
  private ibo: WebGLBuffer = gl.createBuffer()!;

  private transform: mat3;

  private width: number;
  private height: number;

  private size: vec2;

  private color: vec4;

  private attributes: IAttributes = {
    a_position: gl.getAttribLocation(this.material.program, "a_position"),
  };

  private uniforms: IUniforms = {
    u_projection: { type: "Matrix3fv", value: undefined, location: null },
    u_view: { type: "Matrix3fv", value: undefined, location: null },
    u_model: { type: "Matrix3fv", value: undefined, location: null },
    u_color: { type: "4fv", value: undefined, location: null },
    u_scale: { type: "1f", value: undefined, location: null },
    u_tilesize: { type: "2fv", value: undefined, location: null },
    u_offset: { type: "2fv", value: undefined, location: null },
  };

  private loaded = false;

  public constructor(nbCols: number, nbRows: number, tileSize: number, c: vec4) {
    this.transform = mat3.create();

    this.width = nbCols * tileSize;
    this.height = nbRows * tileSize;
    this.size = [tileSize, tileSize];

    this.color = c;
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
      this.setUniform("u_tilesize", this.size);
      this.setUniform("u_offset", offset);

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
}

export default Grid;
