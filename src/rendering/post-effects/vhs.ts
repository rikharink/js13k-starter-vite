import { ResourceManager } from '../../managers/resource-manager';
import { Milliseconds } from '../../types';
import { Framebuffer } from '../framebuffer';
import { GL_TEXTURE1, GL_TEXTURE_2D } from '../gl-constants';
import { Texture } from '../../textures/texture';
import { PostEffect } from './post-effect';

export class Vhs extends PostEffect {
  private noise: Texture;
  public bend: number = 5;

  constructor(gl: WebGL2RenderingContext, resourceManager: ResourceManager) {
    super('vhs', gl, resourceManager.shaders.get('vhs')!, new Framebuffer(gl));
    this.noise = resourceManager.textures.get('snoise')!;
    super.isEnabled = true;
  }

  apply(gl: WebGL2RenderingContext, input: Framebuffer, time: Milliseconds): Framebuffer | null {
    if (!this.isEnabled) {
      return input;
    }
    this.shader.enable(gl);
    gl.activeTexture(GL_TEXTURE1);
    gl.bindTexture(GL_TEXTURE_2D, this.noise.texture);
    gl.uniform1i(this.shader['u_noise'], 1);
    gl.uniform1f(this.shader['u_bend'], this.bend);
    this.render(gl, input, time);
    return this.output;
  }
}
