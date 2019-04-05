import md5 from 'md5';
import { mat3, vec2 } from 'gl-matrix';

import Material from '@src/animation/Material';
import { gl } from '@src/Game';

import { IAttributes, IUniforms } from './../shared/models/sprite.model';

import vs from '@assets/shaders/sprite.vs.glsl';
import fs from '@assets/shaders/sprite.fs.glsl';

class Sprite extends Material
{
  private static LOADED_SPRITES: Map<string, Sprite> = new Map<string, Sprite>();
  private static LOADED_FILES: Map<string, HTMLImageElement> = new Map<string, HTMLImageElement>();
  private static INDICES: Uint16Array = new Uint16Array([ 3, 2, 1, 3, 1, 0 ]);

  private src: string;
  private alias: string;
  private tileWidth: number;
  private tileHeight: number;
  
  private width: number;
  private height: number;

  private loaded: boolean;

  private texture: WebGLTexture;

  private vao: WebGLVertexArrayObject;
  private vbo: WebGLBuffer;
  private ibo: WebGLBuffer;
  private tbo: WebGLBuffer;

  private attributes: IAttributes;
  private uniforms: IUniforms;

  constructor(src: string, alias:string, tw: number, th: number) {
    super(vs, fs);

    this.src = src;
    this.alias = alias;
    this.tileWidth = tw;
    this.tileHeight = th;

    this.width = -1;
    this.height = -1;

    this.loaded = false;

    this.vao = gl.createVertexArray();
    this.vbo = gl.createBuffer();
    this.ibo = gl.createBuffer();
    this.tbo = gl.createBuffer();

    this.texture = gl.createTexture();

    this.attributes = {
      a_position: gl.getAttribLocation(this.program, 'a_position'),
      a_texture_coord: gl.getAttribLocation(this.program, 'a_texture_coord')
    };

    this.uniforms = {
      u_world: { type: "Matrix3fv", value: mat3.create() },
      u_view: { type: "Matrix3fv", value: mat3.create() },
      u_frame: { type: "2fv", value: vec2.create() },
      u_object: { type: "Matrix3fv", value: mat3.create() },
      u_image: { type: "1i", value: 0 },
    };
  }

  async init() {
    for (let key in this.uniforms) {
      this.uniforms[key].location = gl.getUniformLocation(this.program, key);
    }

    const image: HTMLImageElement = await Sprite.load(this.src);
    console.info(`Loaded sprite "${this.alias}" ${this.tileWidth}x${this.tileHeight}`);

    this.width = image.width;
    this.height = image.height;

    this.setup(image);
  }

  setup(image: HTMLImageElement) {
    gl.useProgram(this.program);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, Sprite.createQuadVertices(0, 0, this.tileWidth, this.tileHeight), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Sprite.INDICES, gl.STATIC_DRAW);

    gl.bindVertexArray(this.vao);

    gl.enableVertexAttribArray(this.attributes.a_position);
    gl.vertexAttribPointer(this.attributes.a_position, 2, gl.FLOAT, false, 0, 0);

    // texture
    gl.bindBuffer(gl.ARRAY_BUFFER, this.tbo);
    gl.bufferData(gl.ARRAY_BUFFER, Sprite.createQuadVertices(0, 0, this.tileWidth / this.width, this.tileHeight / this.height), gl.STATIC_DRAW);
    
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

  render(world: any, transform: any, position: any, row: number, col: number, orientation: number) {
    if (this.loaded) {
      this.uniforms.u_world.value = world;
      this.uniforms.u_view.value = transform;
      this.uniforms.u_object.value = position;
      this.uniforms.u_frame.value[0] = ((col + (orientation[0] === -1 ? 1 : 0)) * this.tileWidth / this.width) * orientation[0];
      this.uniforms.u_frame.value[1] = ((row + (orientation[1] === -1 ? 1 : 0)) * this.tileHeight / this.height) * orientation[1];

      gl.useProgram(this.program);

      gl.bindVertexArray(this.vao);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
      gl.bindTexture(gl.TEXTURE_2D, this.texture);

      /*
      for (let key in this.uniforms) {
        const uniform = this.uniforms[key];
      
        switch(uniform.type) {
          case '1i': this.gl.uniform1i(uniform.location, uniform.value); break;
          case '1f': this.gl.uniform1f(uniform.location, uniform.value); break;
          case '2f':  this.gl.uniform2f(uniform.location, uniform.value[0], uniform.value[1]); break;
          case '3f': this.gl.uniform3f(uniform.location, uniform.value[0], uniform.value[1], uniform.value[2]); break;
          case '4f': this.gl.uniform4f(uniform.location, uniform.value[0], uniform.value[1], uniform.value[2], uniform.value[3]); break;
          case '1iv': this.gl.uniform1iv(uniform.location, uniform.value); break;
          case '3iv': this.gl.uniform3iv(uniform.location, uniform.value); break;
          case '1fv': this.gl.uniform1fv(uniform.location, uniform.value); break;
          case '2fv': this.gl.uniform2fv(uniform.location, uniform.value); break;
          case '3fv': this.gl.uniform3fv(uniform.location, uniform.value);break;
          case '4fv': this.gl.uniform4fv(uniform.location, uniform.value); break;
          case 'Matrix3fv': this.gl.uniformMatrix3fv(uniform.location, false, uniform.value); break;
          case 'Matrix4fv': this.gl.uniformMatrix4fv(uniform.location, false, uniform.value); break;
        }
      }
      */

      gl.uniformMatrix3fv(this.uniforms.u_world.location, false, this.uniforms.u_world.value);
      gl.uniformMatrix3fv(this.uniforms.u_view.location, false, this.uniforms.u_view.value);
      gl.uniformMatrix3fv(this.uniforms.u_object.location, false, this.uniforms.u_object.value);
      gl.uniform1i(this.uniforms.u_image.location, this.uniforms.u_image.value);
      gl.uniform2fv(this.uniforms.u_frame.location, this.uniforms.u_frame.value);
      
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }
  }

  static createQuadVertices(x: number, y: number, w: number, h: number): Float32Array {
    return new Float32Array([ 
      x, y + h,
      x, y,
      x + w, y,
      x + w, y + h,
    ]);
  }

  static async load(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const hash: string = md5(src);

      if (Sprite.LOADED_FILES.has(hash) === true) {
        resolve(Sprite.LOADED_FILES.get(hash));
      }

      const image: HTMLImageElement = new Image();

      image.onload = () => {
        Sprite.LOADED_FILES.set(hash, image);
        resolve(image);
      };
      image.onerror = () => {
        reject(`Could not load sprite @ ${src}`);
      };

      image.src = src;
    });
  }

  static async create(src: string, alias: string, tw: number, th: number): Promise<Sprite> {
    if (Sprite.LOADED_SPRITES.has(alias) === true) {
      return Sprite.LOADED_SPRITES.get(alias);
    }

    const sprite = new Sprite(src, alias, tw, th);
    await sprite.init();
    Sprite.LOADED_SPRITES.set(alias, sprite);

    return sprite;
  }

  static get(alias) {
    return Sprite.LOADED_SPRITES.get(alias);
  }
}

export default Sprite;