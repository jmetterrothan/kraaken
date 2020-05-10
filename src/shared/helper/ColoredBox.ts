import { mat3 } from "gl-matrix";

import WebGL2H from "@shared/utility/WebGL2H";
import Material from "@src/animation/Material";
import Color from "@src/shared/helper/Color";

import Box2 from "@shared/math/Box2";

import { gl } from "@src/Game";

import { IAttributes, IUniforms } from "@shared/models/sprite.model";

import fsColor from "@assets/shaders/color.fs.glsl";
import vsObject from "@assets/shaders/object.vs.glsl";

class ColoredBox {
  private colorMaterial: Material = new Material(vsObject, fsColor);

  private vao: WebGLVertexArrayObject = gl.createVertexArray();
  private vbo: WebGLBuffer = gl.createBuffer();
  private ibo: WebGLBuffer = gl.createBuffer();

  public readonly bbox: Box2;

  public constructor(bbox: Box2) {
    this.bbox = bbox;
  }

  private attributes: IAttributes = {
    a_position: gl.getAttribLocation(this.colorMaterial.program, "a_position"),
  };

  private uniforms: IUniforms = {
    u_mvp: { type: "Matrix3fv", value: undefined },
    u_color: { type: "4fv", value: undefined },
  };

  public async init() {
    for (const key in this.uniforms) {
      if (this.uniforms[key]) {
        this.uniforms[key].location = gl.getUniformLocation(this.colorMaterial.program, key);
      }
    }

    this.setup();
  }

  public use() {
    gl.useProgram(this.colorMaterial.program);

    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
  }

  public render(viewProjectionMatrix: mat3, modelMatrix: mat3, color: Color) {
    this.setUniform("u_mvp", mat3.multiply(mat3.create(), viewProjectionMatrix, modelMatrix));
    this.setUniform("u_color", color.toVec4());

    gl.drawElements(gl.LINE_LOOP, 6, gl.UNSIGNED_SHORT, 0);
  }

  private setUniform(key: string, value: any) {
    this.uniforms[key].value = value;
    WebGL2H.setUniform(gl, this.uniforms[key]);
  }

  private setup() {
    gl.useProgram(this.colorMaterial.program);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, WebGL2H.createQuadVertices(0, 0, this.bbox.width, this.bbox.height), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([3, 2, 1, 3, 1, 0]), gl.STATIC_DRAW);

    gl.bindVertexArray(this.vao);

    gl.enableVertexAttribArray(this.attributes.a_position);
    gl.vertexAttribPointer(this.attributes.a_position, 2, gl.FLOAT, false, 0, 0);
  }
}

export default ColoredBox;