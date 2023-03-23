import frag from './default.frag';
import vert from './default.vert';

console.log(frag, vert);

import { GL_COLOR_BUFFER_BIT, GL_STENCIL_BUFFER_BIT } from '../gl-constants';
import { hexToNormalizedRgb } from '../math/color';
import { Settings } from '../settings';
import { State } from '../state';
import { initShaderProgram } from './gl-util';
import { Shader } from './shader';

export class Renderer {
  private shader: Shader;

  constructor(ctx: WebGL2RenderingContext) {
    this.shader = initShaderProgram(ctx, vert, frag)!;
  }

  public render(ctx: WebGL2RenderingContext, state: State, _alpha: number): void {
    this.shader.enable(ctx);
    const clearColor = hexToNormalizedRgb(state.clearColor);
    ctx.viewport(0, 0, Settings.resolution[0], Settings.resolution[1]);
    ctx.clearColor(clearColor[0], clearColor[1], clearColor[2], 1);
    ctx.clear(GL_COLOR_BUFFER_BIT | GL_STENCIL_BUFFER_BIT | GL_COLOR_BUFFER_BIT);
  }
}
