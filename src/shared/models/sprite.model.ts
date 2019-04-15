export interface IAttributes {
  [key: string]: number;
}

export interface IUniforms {
  [key: string]: {
    type: string;
    value: any;
    location?: WebGLUniformLocation;
  };
}

export interface ISpriteData {
  src: string;
  name: string;
  tileWidth: number;
  tileHeight: number;
}
