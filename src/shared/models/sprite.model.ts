export type IAttributes = {
  [key: string]: number;
};

export type IUniforms = {
  [key: string]: {
    type: string;
    value: any;
    location?: WebGLUniformLocation;
  };
};