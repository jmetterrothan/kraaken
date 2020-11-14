import { mat3, vec2 } from "gl-matrix";

import Material from "@src/animation/Material";
import SpriteManager from "@src/animation/SpriteManager";

import { gl } from "@src/Game";

import Vector2 from "@shared/math/Vector2";
import WebGL2H from "@shared/utility/WebGL2H";

import { ISpriteRenderRenderOptions } from "@shared/models/animation.model";
import { IAttributes, IUniforms } from "@shared/models/sprite.model";

import vsObject from "@assets/shaders/sprite.vs.glsl";
import fsSprite from "@assets/shaders/sprite.fs.glsl";

class SpriteAtlas {
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

  private attributes: IAttributes = {
    a_position: gl.getAttribLocation(this.textureMaterial.program, "a_position"),
    a_texture_coord: gl.getAttribLocation(this.textureMaterial.program, "a_texture_coord"),
  };

  private uniforms: IUniforms = {
    u_projection: { type: "Matrix3fv", value: undefined },
    u_view: { type: "Matrix3fv", value: undefined },
    u_model: { type: "Matrix3fv", value: undefined },
    u_frame: { type: "2fv", value: undefined },
    u_grayscale: { type: "1i", value: false },
    u_outline: { type: "1i", value: false },
    u_outline_color: { type: "4fv", value: undefined },
    u_size: { type: "2fv", value: undefined },
    u_image: { type: "1i", value: undefined },
    u_tint_color: { type: "4fv", value: undefined },
    u_tint_effect: { type: "1i", value: undefined }
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

  public computeTileCoord(row: number, col: number, dx: number, dy: number, reflect = false): vec2 {
    const rdx = (reflect && dx) < 0 ? -1 : 1;
    const rdy = (reflect && dy) < 0 ? -1 : 1;

    // calculate frame woords in a 0 - 1 range
    const x = (((col + (rdx === -1 ? 1 : 0)) * this.tileWidth) / this.width) * rdx;
    const y = (((row + (rdy === -1 ? 1 : 0)) * this.tileHeight) / this.height) * rdy;

    return vec2.fromValues(x, y);
  }

  public render(projectionMatrix: mat3, viewMatrix: mat3, modelMatrix: mat3, frame: { row: number; col: number; }, direction: Vector2 | undefined, renderOptions: ISpriteRenderRenderOptions): void {
    // flickering effect - skip frames
    if (renderOptions.flickering && Math.floor(window.performance.now() / renderOptions.flickerSpeed) % 2) {
      return;
    }
    
    if (this.loaded) {
      const dx = direction?.x ?? 1;
      const dy = direction?.y ?? 1;

      this.setUniform("u_grayscale", renderOptions.grayscale);
      this.setUniform("u_tint_effect", renderOptions.tintEffect);
      this.setUniform("u_tint_color", renderOptions.tintColor);
      this.setUniform("u_outline", renderOptions.outline);
      this.setUniform("u_outline_color", renderOptions.outlineColor);
      
      this.setUniform("u_projection", projectionMatrix);
      this.setUniform("u_view", viewMatrix);
      this.setUniform("u_model", modelMatrix);
      
      this.setUniform("u_size", [this.width, this.height]);
      this.setUniform("u_frame", this.computeTileCoord(frame.row, frame.col, dx, dy, renderOptions.reflect));

      gl.drawElements(gl.TRIANGLE_FAN, 6, gl.UNSIGNED_SHORT, 0);
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

  public get nbRows(): number {
    return this.height / this.tileHeight;
  }

  public get nbCols(): number {
    return this.width / this.tileWidth;
  }
}

export default SpriteAtlas;
