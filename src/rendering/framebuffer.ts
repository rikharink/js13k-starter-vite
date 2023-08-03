import { Vector2 } from '../math/vector2';
import { Settings } from '../settings';
import { GL_COLOR_ATTACHMENT0, GL_FRAMEBUFFER, GL_TEXTURE_2D } from './gl-constants';
import { createTexture } from './gl-util';

export class Framebuffer {
  public texture: WebGLTexture;
  public buffer: WebGLFramebuffer;

  constructor(gl: WebGL2RenderingContext, resolution?: Vector2) {
    resolution = resolution ?? [Settings.resolution[0], Settings.resolution[1]];
    this.buffer = gl.createFramebuffer()!;
    gl.bindFramebuffer(GL_FRAMEBUFFER, this.buffer);
    this.texture = createTexture(gl, resolution);
    gl.framebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, this.texture, 0);
  }

  enable(gl: WebGL2RenderingContext) {
    gl.bindFramebuffer(GL_FRAMEBUFFER, this.buffer);
  }
}
