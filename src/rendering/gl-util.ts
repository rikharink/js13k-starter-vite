import { Vector2 } from '../math/vector2';
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
  GL_UNIFORM_BLOCK_INDEX,
  GL_UNIFORM_OFFSET,
  GL_ARRAY_BUFFER,
  GL_ELEMENT_ARRAY_BUFFER,
  GL_UNPACK_FLIP_Y_WEBGL,
  GL_UNPACK_PREMULTIPLY_ALPHA_WEBGL,
  GL_LINEAR,
  GL_REPEAT,
} from './gl-constants';
import { Shader } from './shaders/shader';
import { Texture } from '../textures/texture';

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
  if (import.meta.env.DEV && attributeLocation === undefined) {
    throw Error(`Couldn't find attribute ${attribute} in shader`);
  }
  gl.bindBuffer(target, buffer);
  gl.bufferData(target, data, isDynamic ? GL_DYNAMIC_DRAW : GL_STATIC_DRAW);
  gl.vertexAttribPointer(attributeLocation, size, GL_FLOAT, false, stride, offset);
  gl.enableVertexAttribArray(attributeLocation);
  return buffer;
}

export function createTexture(gl: WebGL2RenderingContext, size: Vector2): WebGLTexture {
  const texture = gl.createTexture()!;
  gl.bindTexture(GL_TEXTURE_2D, texture);
  gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
  gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
  gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
  gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
  gl.texImage2D(GL_TEXTURE_2D, 0, GL_RGBA, size[0], size[1], 0, GL_RGBA, GL_UNSIGNED_BYTE, null);
  return texture;
}

export function canvasToTexture(
  gl: WebGL2RenderingContext,
  canvas: HTMLCanvasElement | OffscreenCanvas,
  texture: WebGLTexture,
  scaleNearest = false,
  repeat = false,
): WebGLTexture {
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  gl.bindTexture(GL_TEXTURE_2D, texture);
  gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, repeat ? GL_REPEAT : GL_CLAMP_TO_EDGE);
  gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, repeat ? GL_REPEAT : GL_CLAMP_TO_EDGE);
  gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, scaleNearest ? GL_NEAREST : GL_LINEAR);
  gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, scaleNearest ? GL_NEAREST : GL_LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
  return texture;
}

export function loadTexture(
  gl: WebGL2RenderingContext,
  url: string,
  scaleNearest = false,
  repeat = false,
): Promise<Texture> {
  return new Promise((resolve, reject) => {
    let texture: Texture = {
      texture: gl.createTexture()!,
      size: [1, 1],
      sourceRect: {
        position: [0, 0],
        size: [1, 1],
      },
    };

    gl.bindTexture(GL_TEXTURE_2D, texture.texture);
    const level = 0;
    const internalFormat = GL_RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = GL_RGBA;
    const srcType = GL_UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
    gl.texImage2D(GL_TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);

    const image = new Image();

    image.onload = () => {
      gl.bindTexture(GL_TEXTURE_2D, texture.texture);
      gl.pixelStorei(GL_UNPACK_FLIP_Y_WEBGL, true);
      gl.pixelStorei(GL_UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, repeat ? GL_REPEAT : GL_CLAMP_TO_EDGE);
      gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, repeat ? GL_REPEAT : GL_CLAMP_TO_EDGE);
      gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, scaleNearest ? GL_NEAREST : GL_LINEAR);
      gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, scaleNearest ? GL_NEAREST : GL_LINEAR);
      gl.texImage2D(GL_TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);
      gl.generateMipmap(GL_TEXTURE_2D);
      texture.size = [image.width, image.height];
      texture.sourceRect.size = texture.size;
      resolve(texture);
    };

    image.onerror = reject;

    image.src = url;
  });
}

export function logAllActiveUniforms(gl: WebGL2RenderingContext, program: WebGLProgram) {
  const numUniforms = gl.getProgramParameter(program, GL_ACTIVE_UNIFORMS);
  const indices = [...Array(numUniforms).keys()];
  const blockIndices = gl.getActiveUniforms(program, indices, GL_UNIFORM_BLOCK_INDEX);
  const offsets = gl.getActiveUniforms(program, indices, GL_UNIFORM_OFFSET);
  for (let ii = 0; ii < numUniforms; ++ii) {
    const uniformInfo = gl.getActiveUniform(program, ii)!;

    const { name, type, size } = uniformInfo;
    const blockIndex = blockIndices[ii];
    const offset = offsets[ii];
    console.log(name, size, type, blockIndex, offset);
  }
}

export function createArrayBuffer(gl: WebGL2RenderingContext, data: Float32Array, isStatic = true): WebGLBuffer {
  const buffer = gl.createBuffer()!;
  gl.bindBuffer(GL_ARRAY_BUFFER, buffer);
  gl.bufferData(GL_ARRAY_BUFFER, data, isStatic ? GL_STATIC_DRAW : GL_DYNAMIC_DRAW);

  return buffer;
}

export function createIndexBuffer(
  gl: WebGL2RenderingContext,
  data: Uint8Array | Uint16Array | Uint32Array,
  isStatic = true,
): WebGLBuffer {
  const buffer = gl.createBuffer()!;
  gl.bindBuffer(GL_ELEMENT_ARRAY_BUFFER, buffer);
  gl.bufferData(GL_ELEMENT_ARRAY_BUFFER, data, isStatic ? GL_STATIC_DRAW : GL_DYNAMIC_DRAW);

  return buffer;
}
