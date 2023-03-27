import frag from './default.frag?raw';
import vert from './default.vert?raw';

import { GL_COLOR_BUFFER_BIT, GL_DEPTH_TEST, GL_STENCIL_BUFFER_BIT } from '../gl-constants';
import { hexToNormalizedRgb } from '../math/color';
import { Settings } from '../settings';
import { State } from '../state';
import { initShaderProgram } from './gl-util';
import { Shader } from './shader';
import { Triangle } from './mesh/triangle';

export class Renderer {
  private shader: Shader;
  private triangle: Triangle;

  constructor(gl: WebGL2RenderingContext) {
    this.shader = initShaderProgram(gl, vert, frag)!;
    this.triangle = new Triangle(gl, this.shader);
  }

  public render(gl: WebGL2RenderingContext, state: State, _alpha: number): void {
    this.shader.enable(gl);
    const clearColor = hexToNormalizedRgb(state.clearColor);
    gl.viewport(0, 0, Settings.resolution[0], Settings.resolution[1]);
    gl.clearColor(clearColor[0], clearColor[1], clearColor[2], 1);
    gl.enable(GL_DEPTH_TEST);
    gl.clear(GL_COLOR_BUFFER_BIT | GL_STENCIL_BUFFER_BIT | GL_COLOR_BUFFER_BIT);
    this.triangle.render(gl);
  }
}
