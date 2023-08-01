import { ResourceManager } from '../../managers/resource-manager';
import { create } from '../../math/matrix4x4';
import { Framebuffer } from '../framebuffer';
import { PostEffect } from './post-effect';

export class Passthrough extends PostEffect {
  public constructor(gl: WebGL2RenderingContext, resourceManager: ResourceManager, output?: Framebuffer | null) {
    super('passthrough', gl, resourceManager.shaders.get('post')!, output);
  }

  apply(gl: WebGL2RenderingContext, input: Framebuffer): Framebuffer | null {
    this.shader.enable(gl);
    gl.uniformMatrix4fv(this.shader['u_colorMatrix'], false, create());
    gl.uniform4f(this.shader['u_offset'], 0, 0, 0, 1);
    this.render(gl, input);
    return this.output;
  }
}
