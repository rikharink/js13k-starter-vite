import { GL_COLOR_ATTACHMENT0, GL_FRAMEBUFFER, GL_TEXTURE_2D } from './gl-constants';
import { createTexture } from './gl-util';

export class Framebuffer {
  public texture: WebGLTexture;
  public buffer: WebGLFramebuffer;

  constructor(gl: WebGL2RenderingContext) {
    this.buffer = gl.createFramebuffer()!;
    gl.bindFramebuffer(GL_FRAMEBUFFER, this.buffer);
    this.texture = createTexture(gl, [gl.drawingBufferWidth, gl.drawingBufferHeight]);
    gl.framebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, this.texture, 0);
  }

  enable(gl: WebGL2RenderingContext) {
    gl.bindFramebuffer(GL_FRAMEBUFFER, this.buffer);
  }
}
