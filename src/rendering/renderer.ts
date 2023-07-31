import {
  GL_COLOR_BUFFER_BIT,
  GL_CULL_FACE,
  GL_DEPTH_BUFFER_BIT,
  
  GL_DEPTH_TEST,
  GL_STENCIL_BUFFER_BIT,
} from './gl-constants';
import { Settings } from '../settings';
import { Scene } from '../scenes/scene';
import { Framebuffer } from './framebuffer';
import { ResourceManager } from '../managers/resource-manager';

export class Renderer {
  private sceneBuffer: Framebuffer;
  private resourceManager: ResourceManager;

  constructor(gl: WebGL2RenderingContext, resourceManager: ResourceManager) {
    this.sceneBuffer = new Framebuffer(gl);
    this.resourceManager = resourceManager;
  }

  stop = false;

  public render(gl: WebGL2RenderingContext, scene: Scene, _alpha: number): void {
    this.sceneBuffer.enable(gl);
    gl.disable(GL_DEPTH_TEST);
    gl.disable(GL_CULL_FACE);
    const clearColor = scene.clearColor;
    gl.clearColor(clearColor[0], clearColor[1], clearColor[2], 1);
    gl.viewport(0, 0, Settings.resolution[0], Settings.resolution[1]);
    gl.clear(GL_DEPTH_BUFFER_BIT | GL_STENCIL_BUFFER_BIT | GL_COLOR_BUFFER_BIT);
    scene.render(gl);
    this.postProcess(gl);
  }

  private postProcess(gl: WebGL2RenderingContext) {
    let input = this.sceneBuffer;
    for (const fx of this.resourceManager.getAllPostEffects()) {
      const result = fx.apply(gl, input);
      if (result != null) {
        input = result;
      }
    }
  }
}
