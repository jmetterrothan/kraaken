const createShader = (gl: WebGLRenderingContext, type: number, source: string): WebGLShader => {
  const shader: WebGLShader = gl.createShader(type);

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.log(gl.getShaderInfoLog(shader), source);

    gl.deleteShader(shader);
    return null;
  }

  return shader;
};

const createProgram = (gl: WebGLRenderingContext, vsSource: string, fsSource: string, validate: boolean = false): WebGLProgram => {
  const vertexShader: WebGLShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader: WebGLShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

  if (!vertexShader || !fragmentShader) {
    throw new Error('Could not continue program initialization');
  }

  const program: WebGLProgram = gl.createProgram();

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));

    gl.deleteProgram(program);
    return null;
  }

  if (validate) {
    gl.validateProgram(program);
    
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
      console.error(gl.getProgramInfoLog(program));

      gl.deleteProgram(program);
      return null;
    }
  }

  gl.detachShader(program, vertexShader);
  gl.detachShader(program, fragmentShader);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  return program;
};

export default {
  createShader,
  createProgram
};