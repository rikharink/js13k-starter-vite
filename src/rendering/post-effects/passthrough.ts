import { ResourceManager } from '../../managers/resource-manager';
import { Framebuffer } from '../framebuffer';
import { PostEffect } from './post-effect';

export class Passthrough extends PostEffect {
  public constructor(gl: WebGL2RenderingContext, resourceManager: ResourceManager, output?: Framebuffer | null) {
    super('passthrough', gl, resourceManager.shaders.get('post')!, output);
  }

  apply(gl: WebGL2RenderingContext, input: Framebuffer): Framebuffer | null {
    this.shader.enable(gl);
    gl.uniform4f(this.shader['cf'], 1, 1, 1, 1);
    this.render(gl, input);
    return this.output;
  }
}
