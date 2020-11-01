import { vec2 } from 'gl-matrix';
import { configSvc } from '@src/shared/services/ConfigService';
import { mat3 } from 'gl-matrix';

import Material from "@src/animation/Material";

import { gl } from "@src/Game";

import WebGL2H from "@shared/utility/WebGL2H";

import { IAttributes, IUniforms } from "@shared/models/sprite.model";

import vsObject from "@assets/shaders/grid.vs.glsl";
import fsSprite from "@assets/shaders/grid.fs.glsl";

class Grid {
  private material: Material = new Material(vsObject, fsSprite);

  private vao: WebGLVertexArrayObject = gl.createVertexArray();
  private vbo: WebGLBuffer = gl.createBuffer();
  private ibo: WebGLBuffer = gl.createBuffer();

  private transform: mat3;

  private attributes: IAttributes = {
    a_position: gl.getAttribLocation(this.material.program, "a_position"),
  };

  private uniforms: IUniforms = {
    u_projection: { type: "Matrix3fv", value: undefined },
    u_view: { type: "Matrix3fv", value: undefined },
    u_model: { type: "Matrix3fv", value: undefined },
    u_color: { type: "4fv", value: [0, 0, 0, 0.5] },
    u_scale: { type: "1f", value: 1.0 },
    u_tilesize: { type: "2fv", value: [16.0, 16.0] },
  };

  private loaded = false;

  public constructor() {
    this.transform = mat3.create();
  }

  public async init(): Promise<void> {
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
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
  }

  public render(projectionMatrix: mat3, viewMatrix: mat3): void {
    if (this.loaded) {
      this.setUniform("u_projection", projectionMatrix);
      this.setUniform("u_view", viewMatrix);
      this.setUniform("u_model", this.transform);
      this.setUniform("u_color", [0, 0, 0, 0.5]);
      this.setUniform("u_scale", configSvc.scale);
      this.setUniform("u_tilesize", [16.0, 16.0]);
 
      gl.drawElements(gl.TRIANGLE_FAN, 6, gl.UNSIGNED_SHORT, 0);
    }
  }

  private setUniform(key: string, value: any) {
    this.uniforms[key].value = value;
    WebGL2H.setUniform(gl, this.uniforms[key]);
  }

  private setup() {
    gl.useProgram(this.material.program);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, WebGL2H.createQuadVertices(0, 0, 16 * 100, 16 * 32), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([3, 2, 1, 3, 1, 0]), gl.STATIC_DRAW);

    gl.bindVertexArray(this.vao);

    gl.enableVertexAttribArray(this.attributes.a_position);
    gl.vertexAttribPointer(this.attributes.a_position, 2, gl.FLOAT, false, 0, 0);

    this.loaded = true;
  }
}

export default Grid;
