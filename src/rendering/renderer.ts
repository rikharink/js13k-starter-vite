import { GL_COLOR_BUFFER_BIT, GL_DEPTH_BUFFER_BIT, GL_DEPTH_TEST, GL_STENCIL_BUFFER_BIT } from './gl-constants';
import { Settings } from '../settings';
import { Scene } from '../scenes/scene';

export class Renderer {
  constructor(gl: WebGL2RenderingContext) {
    gl.enable(GL_DEPTH_TEST);
  }

  stop = false;

  public render(gl: WebGL2RenderingContext, scene: Scene, _alpha: number): void {
    const clearColor = scene.clearColor;
    gl.clearColor(clearColor[0], clearColor[1], clearColor[2], 1);
    gl.viewport(0, 0, Settings.resolution[0], Settings.resolution[1]);
    gl.clear(GL_DEPTH_BUFFER_BIT | GL_STENCIL_BUFFER_BIT | GL_COLOR_BUFFER_BIT);

    scene.render(gl);
  }
}
