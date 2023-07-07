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
  GL_FRAMEBUFFER,
} from './gl-constants';
import { Shader } from './shader';

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
  offset = 0
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

export function createFramebuffer(gl: WebGL2RenderingContext): Framebuffer {
  const buffer = gl.createFramebuffer()!;
  gl.bindFramebuffer(GL_FRAMEBUFFER, buffer);
  const texture = createTexture(gl, [gl.drawingBufferWidth, gl.drawingBufferHeight]);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

  return {
    texture: texture,
    buffer: buffer,
  };
}

export function createTexture(gl: WebGL2RenderingContext, size: [number, number]): WebGLTexture {
  const texture = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size[0], size[1], 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  return texture;
}

export interface Framebuffer {
  texture: WebGLTexture;
  buffer: WebGLFramebuffer;
}
