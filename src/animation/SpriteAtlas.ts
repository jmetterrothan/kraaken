import { mat3, vec4, vec2 } from "gl-matrix";

import Material from "@src/animation/Material";
import SpriteManager from "@src/animation/SpriteManager";

import { gl } from "@src/Game";

import Vector2 from "@shared/math/Vector2";
import { ISpriteRenderParameters } from "@shared/models/animation.model";
import { IAttributes, IUniforms } from "@shared/models/sprite.model";
import WebGL2H from "@shared/utility/WebGL2H";

import vsObject from "@assets/shaders/object.vs.glsl";
import fsSprite from "@assets/shaders/sprite.fs.glsl";

class SpriteTexture {
  private textureMaterial: Material = new Material(vsObject, fsSprite);

  public readonly src: string;
  public readonly alias: string;
  public readonly tileWidth: number;
  public readonly tileHeight: number;

  private width = -1;
  private height = -1;

  private loaded = false;

  private texture: WebGLTexture = gl.createTexture();

  private vao: WebGLVertexArrayObject = gl.createVertexArray();
  private vbo: WebGLBuffer = gl.createBuffer();
  private ibo: WebGLBuffer = gl.createBuffer();
  private tbo: WebGLBuffer = gl.createBuffer();

  private coords: vec2 = vec2.fromValues(0, 0);

  private attributes: IAttributes = {
    a_position: gl.getAttribLocation(this.textureMaterial.program, "a_position"),
    a_texture_coord: gl.getAttribLocation(this.textureMaterial.program, "a_texture_coord"),
  };

  private uniforms: IUniforms = {
    u_mvp: { type: "Matrix3fv", value: undefined },
    u_frame: { type: "2fv", value: undefined },
    u_color: { type: "4fv", value: undefined },
    u_grayscale: { type: "1i", value: false },
    u_flashing: { type: "1i", value: false },
    u_wireframe: { type: "1i", value: false },
    u_image: { type: "1i", value: undefined },
    u_alpha: { type: "1f", value: 1 },
  };

  constructor(src: string, alias: string, tw: number, th: number) {
    this.src = src;
    this.alias = alias;
    this.tileWidth = tw;
    this.tileHeight = th;
  }

  public async init(): Promise<void> {
    for (const key in this.uniforms) {
      if (this.uniforms[key]) {
        this.uniforms[key].location = gl.getUniformLocation(this.textureMaterial.program, key);
      }
    }

    const image: HTMLImageElement = await SpriteManager.load(this.src);
    console.info(`Loaded sprite "${this.alias}" ${this.tileWidth}x${this.tileHeight}`);

    this.width = image.width;
    this.height = image.height;

    this.setup(image);
  }

  public use(): void {
    gl.useProgram(this.textureMaterial.program);

    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
  }

  public render(viewProjectionMatrix: mat3, modelMatrix: mat3, row: number, col: number, direction: Vector2 | undefined, parameters: ISpriteRenderParameters): void {
    if (this.loaded) {
      const dx = (parameters.reflect && (direction?.x ?? 1)) < 0 ? -1 : 1;
      const dy = (parameters.reflect && (direction?.y ?? 1)) < 0 ? -1 : 1;

      // calculate frame woords in a 0 - 1 range
      this.coords[0] = (((col + (dx === -1 ? 1 : 0)) * this.tileWidth) / this.width) * dx;
      this.coords[1] = (((row + (dy === -1 ? 1 : 0)) * this.tileHeight) / this.height) * dy;

      this.setUniform("u_alpha", parameters.alpha);
      this.setUniform("u_grayscale", parameters.grayscale);
      this.setUniform("u_flashing", parameters.flashing);
      this.setUniform("u_wireframe", parameters.wireframe);
      this.setUniform("u_color", parameters.color.toVec4());
      this.setUniform("u_frame", this.coords);
      this.setUniform("u_mvp", mat3.multiply(mat3.create(), viewProjectionMatrix, modelMatrix));

      gl.drawElements(parameters.wireframe ? gl.LINE_LOOP : gl.TRIANGLE_FAN, 6, gl.UNSIGNED_SHORT, 0);
    }
  }

  private setUniform(key: string, value: any) {
    this.uniforms[key].value = value;
    WebGL2H.setUniform(gl, this.uniforms[key]);
  }

  private setup(image: HTMLImageElement) {
    gl.useProgram(this.textureMaterial.program);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, WebGL2H.createQuadVertices(0, 0, this.tileWidth, this.tileHeight), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([3, 2, 1, 3, 1, 0]), gl.STATIC_DRAW);

    gl.bindVertexArray(this.vao);

    gl.enableVertexAttribArray(this.attributes.a_position);
    gl.vertexAttribPointer(this.attributes.a_position, 2, gl.FLOAT, false, 0, 0);

    // texture
    gl.bindBuffer(gl.ARRAY_BUFFER, this.tbo);
    gl.bufferData(gl.ARRAY_BUFFER, WebGL2H.createQuadVertices(0, 0, this.tileWidth / this.width, this.tileHeight / this.height), gl.STATIC_DRAW);

    gl.enableVertexAttribArray(this.attributes.a_texture_coord);
    gl.vertexAttribPointer(this.attributes.a_texture_coord, 2, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    gl.bindTexture(gl.TEXTURE_2D, null);

    this.loaded = true;
  }
}

export default SpriteTexture;
