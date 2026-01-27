import WebGL2H from "@src/shared/utility/WebGL2H";

import { gl } from "@src/Game";

class Material {
  public program: WebGLProgram;

  constructor(vs: string, fs: string) {
    this.program = WebGL2H.createProgram(gl, vs, fs);
  }
}

export default Material;
