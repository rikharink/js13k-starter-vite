import { Milliseconds } from '../../types';
import { Framebuffer } from '../framebuffer';
import { GL_FRAMEBUFFER, GL_TEXTURE0, GL_TEXTURE_2D, GL_TRIANGLES } from '../gl-constants';
import { Shader } from '../shaders/shader';

export abstract class PostEffect {
  public name: string;
  public isEnabled: boolean = true;
  protected output: Framebuffer | null;
  protected shader: Shader;

  protected constructor(name: string, gl: WebGL2RenderingContext, shader: Shader, output?: Framebuffer | null) {
    this.name = name;
    this.shader = shader;
    this.output = output !== undefined ? output : new Framebuffer(gl);
  }

  abstract apply(gl: WebGL2RenderingContext, input: Framebuffer, time: Milliseconds): Framebuffer | null;

  protected render(gl: WebGL2RenderingContext, input: Framebuffer, time: Milliseconds) {
    gl.activeTexture(GL_TEXTURE0);
    gl.bindTexture(GL_TEXTURE_2D, input.texture);
    gl.uniform1i(this.shader['u_buffer'], 0);
    gl.bindFramebuffer(GL_FRAMEBUFFER, this.output?.buffer ?? null);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.uniform1f(this.shader['u_time'], time / 1000);
    gl.drawArrays(GL_TRIANGLES, 0, 3);
    return this.output;
  }
}
