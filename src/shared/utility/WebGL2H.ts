import { IAttributes, IUniform, IUniforms } from "@shared/models/sprite.model";

const createShader = (
  gl: WebGL2RenderingContext,
  type: number,
  source: string
): WebGLShader => {
  const shader: WebGLShader = gl.createShader(type);

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn(gl.getShaderInfoLog(shader), source);

    gl.deleteShader(shader);
    return null;
  }

  return shader;
};

const createProgram = (
  gl: WebGL2RenderingContext,
  vsSource: string,
  fsSource: string,
  validate = false
): WebGLProgram => {
  const vertexShader: WebGLShader = createShader(
    gl,
    gl.VERTEX_SHADER,
    vsSource
  );
  const fragmentShader: WebGLShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fsSource
  );

  if (!vertexShader || !fragmentShader) {
    throw new Error("Could not continue program initialization");
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

const setUniforms = (gl: WebGL2RenderingContext, uniforms: IUniforms): void => {
  for (const key in uniforms) {
    if (uniforms[key]) {
      setUniform(gl, uniforms[key]);
    }
  }
};

const setUniform = (gl: WebGL2RenderingContext, uniform: IUniform): void => {
  switch (uniform.type) {
    case "1i":
      gl.uniform1i(uniform.location, uniform.value);
      break;
    case "1f":
      gl.uniform1f(uniform.location, uniform.value);
      break;
    case "2f":
      gl.uniform2f(uniform.location, uniform.value[0], uniform.value[1]);
      break;
    case "3f":
      gl.uniform3f(
        uniform.location,
        uniform.value[0],
        uniform.value[1],
        uniform.value[2]
      );
      break;
    case "4f":
      gl.uniform4f(
        uniform.location,
        uniform.value[0],
        uniform.value[1],
        uniform.value[2],
        uniform.value[3]
      );
      break;
    case "1iv":
      gl.uniform1iv(uniform.location, uniform.value);
      break;
    case "3iv":
      gl.uniform3iv(uniform.location, uniform.value);
      break;
    case "1fv":
      gl.uniform1fv(uniform.location, uniform.value);
      break;
    case "2fv":
      gl.uniform2fv(uniform.location, uniform.value);
      break;
    case "3fv":
      gl.uniform3fv(uniform.location, uniform.value);
      break;
    case "4fv":
      gl.uniform4fv(uniform.location, uniform.value);
      break;
    case "Matrix3fv":
      gl.uniformMatrix3fv(uniform.location, false, uniform.value);
      break;
    case "Matrix4fv":
      gl.uniformMatrix4fv(uniform.location, false, uniform.value);
      break;
  }
};

const createQuadVertices = (
  x: number,
  y: number,
  w: number,
  h: number
): Float32Array => {
  return new Float32Array([x, y + h, x, y, x + w, y, x + w, y + h]);
};

export default {
  createShader,
  createProgram,
  setUniforms,
  setUniform,
  createQuadVertices,
};
