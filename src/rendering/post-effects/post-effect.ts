import { Framebuffer } from '../framebuffer';
import { GL_CULL_FACE, GL_DEPTH_TEST, GL_FRAMEBUFFER, GL_TEXTURE_2D, GL_TRIANGLES } from '../gl-constants';
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

  abstract apply(gl: WebGL2RenderingContext, input: Framebuffer): Framebuffer | null;

  protected render(gl: WebGL2RenderingContext, input: Framebuffer) {
    gl.bindTexture(GL_TEXTURE_2D, input.texture);
    gl.bindFramebuffer(GL_FRAMEBUFFER, this.output?.buffer ?? null);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.disable(GL_DEPTH_TEST);
    gl.disable(GL_CULL_FACE);
    gl.drawArrays(GL_TRIANGLES, 0, 3);
    return this.output;
  }
}
