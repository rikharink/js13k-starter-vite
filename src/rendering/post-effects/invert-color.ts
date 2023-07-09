import { ResourceManager } from '../../managers/resource-manager';
import { Framebuffer } from '../framebuffer';
import { PostEffect } from './post-effect';

export class InvertColor extends PostEffect {
  public constructor(gl: WebGL2RenderingContext, resourceManager: ResourceManager) {
    super('invert', gl, resourceManager.shaders.get('post')!);
    this.isEnabled = false;
  }

  public apply(gl: WebGL2RenderingContext, input: Framebuffer): Framebuffer | null {
    if (!this.isEnabled) return input;
    this.shader.enable(gl);

    gl.uniform1i(this.shader['inv'], 1);
    this.render(gl, input);
    gl.uniform1i(this.shader['inv'], 0);

    return this.output;
  }
}
