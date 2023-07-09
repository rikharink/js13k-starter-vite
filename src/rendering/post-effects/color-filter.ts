import { ResourceManager } from '../../managers/resource-manager';
import { NormalizedRgbaColor } from '../../math/color';
import { Framebuffer } from '../framebuffer';
import { PostEffect } from './post-effect';

export class ColorFilter extends PostEffect {
  public color: NormalizedRgbaColor = [1, 1, 1, 1];

  public constructor(gl: WebGL2RenderingContext, resourceManager: ResourceManager) {
    super('color filter', gl, resourceManager.shaders.get('post')!);
    super.isEnabled = true;
  }

  public apply(gl: WebGL2RenderingContext, input: Framebuffer): Framebuffer | null {
    if (!this.isEnabled) return input;
    this.shader.enable(gl);

    gl.uniform4f(this.shader['cf'], ...this.color);
    this.render(gl, input);
    gl.uniform4f(this.shader['cf'], 1, 1, 1, 1);

    return this.output;
  }
}
