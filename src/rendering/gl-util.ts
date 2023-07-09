import {
  GL_ACTIVE_ATTRIBUTES,
  GL_ACTIVE_UNIFORMS,
  GL_COMPILE_STATUS,
  GL_FRAGMENT_SHADER,
  GL_LINK_STATUS,
  GL_VERTEX_SHADER,
  GL_DYNAMIC_DRAW,
  GL_STATIC_DRAW,
  GL_FLOAT,
  GL_TEXTURE_2D,
  GL_TEXTURE_WRAP_S,
  GL_TEXTURE_WRAP_T,
  GL_TEXTURE_MIN_FILTER,
  GL_TEXTURE_MAG_FILTER,
  GL_RGBA,
  GL_UNSIGNED_BYTE,
  GL_CLAMP_TO_EDGE,
  GL_NEAREST,
} from './gl-constants';
import { Shader } from './shaders/shader';

export function initShaderProgram(gl: WebGL2RenderingContext, vertexSource: string, fragSource: string): Shader | null {
  const vertexShader = loadShader(gl, GL_VERTEX_SHADER, vertexSource)!;
  const fragmentShader = loadShader(gl, GL_FRAGMENT_SHADER, fragSource)!;

  const program = gl.createProgram()!;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (process.env.NODE_ENV === 'development' && !gl.getProgramParameter(program, GL_LINK_STATUS)) {
    console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(program));
    return null;
  }
  const wrapper: Shader = new Shader(program);

  const numAttributes = gl.getProgramParameter(program, GL_ACTIVE_ATTRIBUTES);
  for (let i = 0; i < numAttributes; i++) {
    const attribute = gl.getActiveAttrib(program, i)!;
    wrapper[attribute.name] = gl.getAttribLocation(program, attribute.name);
  }

  const numUniforms = gl.getProgramParameter(program, GL_ACTIVE_UNIFORMS);
  for (let i = 0; i < numUniforms; i++) {
    const uniform = gl.getActiveUniform(program, i)!;
    wrapper[uniform.name] = gl.getUniformLocation(program, uniform.name);
  }

  return wrapper;
}

function loadShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (process.env.NODE_ENV === 'development' && !gl.getShaderParameter(shader, GL_COMPILE_STATUS)) {
    console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function setupAttributeBuffer(
  gl: WebGL2RenderingContext,
  shader: Shader,
  attribute: string,
  target: number,
  isDynamic: boolean,
  data: BufferSource | ArrayBufferView | null,
  size: number,
  stride = 0,
  offset = 0,
): WebGLBuffer {
  const buffer = gl.createBuffer()!;
  const attributeLocation = shader[attribute];
  if (attributeLocation === undefined) {
    throw Error(`Couldn't find attribute ${attribute} in shader`);
  }
  gl.bindBuffer(target, buffer);
  gl.bufferData(target, data, isDynamic ? GL_DYNAMIC_DRAW : GL_STATIC_DRAW);
  gl.vertexAttribPointer(attributeLocation, size, GL_FLOAT, false, stride, offset);
  gl.enableVertexAttribArray(attributeLocation);
  return buffer;
}


export function createTexture(gl: WebGL2RenderingContext, size: [number, number]): WebGLTexture {
  const texture = gl.createTexture()!;
  gl.bindTexture(GL_TEXTURE_2D, texture);
  gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
  gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
  gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
  gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
  gl.texImage2D(GL_TEXTURE_2D, 0, GL_RGBA, size[0], size[1], 0, GL_RGBA, GL_UNSIGNED_BYTE, null);
  return texture;
}

export function loadTexture(gl: WebGL2RenderingContext, url: string): Promise<WebGLTexture> {
  const texture = gl.createTexture()!;
  gl.bindTexture(GL_TEXTURE_2D, texture);
  const level = 0;
  const internalFormat = GL_RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = GL_RGBA;
  const srcType = GL_UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);
      gl.generateMipmap(gl.TEXTURE_2D);
      resolve(texture);
    };
    image.onerror = (err) => {
      reject(err);
    };

    image.src = url;
  });
}
