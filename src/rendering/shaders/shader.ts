import { GL_CURRENT_PROGRAM } from '../gl-constants';

export class Shader {
  public constructor(program: WebGLProgram) {
    this.program = program;
  }

  public program: WebGLProgram;
  [key: string]: any;

  public enable(gl: WebGL2RenderingContext): void {
    if (gl.getParameter(GL_CURRENT_PROGRAM) !== this.program) {
      gl.useProgram(this.program);
    }
  }

  public has(attribute: string): boolean {
    return this[attribute] !== undefined;
  }
}
