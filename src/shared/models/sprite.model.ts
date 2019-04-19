export interface IAttributes {
  [key: string]: number;
}

export interface IUniform {
  type: string;
  value: any;
  location?: WebGLUniformLocation;
}

export interface IUniforms {
  [key: string]: IUniform;
}

export interface ISpriteData {
  src: string;
  name: string;
  tileWidth: number;
  tileHeight: number;
}
