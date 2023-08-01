import { canvas } from '../../game';
import { ResourceManager } from '../../managers/resource-manager';
import { Vector2 } from '../../math/vector2';
import { Settings } from '../../settings';
import { Milliseconds } from '../../types';
import { Framebuffer } from '../framebuffer';
import { GL_TEXTURE1, GL_TEXTURE_2D } from '../gl-constants';
import { PostEffect } from './post-effect';

export class Crt extends PostEffect {
  private noise: WebGLTexture;
  public bend = 4;
  public resolution: Vector2 = [Settings.resolution[0], Settings.resolution[1]];
  public scanlineOpacity: number = 0.5;

  constructor(gl: WebGL2RenderingContext, resourceManager: ResourceManager) {
    super('crt', gl, resourceManager.shaders.get('crt')!);
    this.noise = resourceManager.textures.get('noise')!;
    super.isEnabled = true;
  }

  apply(gl: WebGL2RenderingContext, input: Framebuffer, time: Milliseconds): Framebuffer | null {
    if (!this.isEnabled) {
      canvas.style.borderRadius = '0px';
      return input;
    }
    canvas.style.borderRadius = '50px';
    this.shader.enable(gl);
    gl.activeTexture(GL_TEXTURE1);
    gl.bindTexture(GL_TEXTURE_2D, this.noise);
    gl.uniform1i(this.shader['u_noise'], 1);
    gl.uniform1f(this.shader['u_bend'], this.bend);
    gl.uniform2f(this.shader['u_resolution'], ...this.resolution);
    this.render(gl, input, time);
    return this.output;
  }
}
