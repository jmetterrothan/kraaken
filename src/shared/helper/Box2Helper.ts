import { mat3, vec4 } from 'gl-matrix';

import WebGL2H from '@shared/utility/WebGL2H';
import Material from '@src/animation/Material';
import { gl } from '@src/Game';
import Object2d from '@src/objects/Object2d';
import Box2 from '@src/shared/math/Box2';
import World from '@src/world/World';

import { IRGBColorData } from '@shared/models/color.model';
import { IAttributes, IUniforms } from '@shared/models/sprite.model';

import fsColor from '@assets/shaders/color.fs.glsl';
import vsObject from '@assets/shaders/object.vs.glsl';

class Box2Helper extends Object2d {
  private box: Box2;

  private colorMaterial: Material;

  private vao: WebGLVertexArrayObject;
  private vbo: WebGLBuffer;
  private ibo: WebGLBuffer;

  private attributes: IAttributes;
  private uniforms: IUniforms;

  constructor(box: Box2, color: IRGBColorData =  { r: 0, g: 0, b: 0 }) {
    super(box.getCenterX(), box.getCenterY());

    this.box = box;

    this.colorMaterial = new Material(vsObject, fsColor);

    this.vao = gl.createVertexArray();
    this.vbo = gl.createBuffer();
    this.ibo = gl.createBuffer();

    this.attributes = {
      a_position: gl.getAttribLocation(this.colorMaterial.program, 'a_position'),
    };

    this.uniforms = {
      u_mvp: { type: 'Matrix3fv', value: mat3.create() },
      u_color: { type: '4fv', value: vec4.fromValues(color.r, color.g, color.b, 1) },
    };

    this.init();
  }

  public async init() {
    for (const key in this.uniforms) {
      if (this.uniforms[key]) {
        this.uniforms[key].location = gl.getUniformLocation(this.colorMaterial.program, key);
      }
    }

    gl.useProgram(this.colorMaterial.program);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, WebGL2H.createQuadVertices(0, 0, this.box.getWidth(), this.box.getHeight()), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([ 3, 2, 1, 3, 1, 0 ]), gl.STATIC_DRAW);

    gl.bindVertexArray(this.vao);

    gl.enableVertexAttribArray(this.attributes.a_position);
    gl.vertexAttribPointer(this.attributes.a_position, 2, gl.FLOAT, false, 0, 0);
  }

  public update(world: World, delta: number) {
    this.setPositionFromVector2(this.box.getMin());
  }

  public render(viewProjectionMatrix: mat3, alpha: number) {
    this.updateModelMatrix();

    gl.useProgram(this.colorMaterial.program);
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);

    this.setUniform('u_mvp', mat3.multiply(mat3.create(), viewProjectionMatrix, this.modelMatrix));

    gl.drawElements(gl.LINE_LOOP, 6, gl.UNSIGNED_SHORT, 0);
  }

  public getBox2() { return this.box; }

  private setUniform(key: string, value: any) {
    this.uniforms[key].value = value;
    WebGL2H.setUniform(gl, this.uniforms[key]);
  }
}

export default Box2Helper;
