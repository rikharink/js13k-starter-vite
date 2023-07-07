import {
  GL_COLOR_BUFFER_BIT,
  GL_CULL_FACE,
  GL_DEPTH_BUFFER_BIT,
  GL_DEPTH_TEST,
  GL_FRAMEBUFFER,
  GL_STENCIL_BUFFER_BIT,
  GL_TRIANGLES,
} from './gl-constants';
import { Settings } from '../settings';
import { Scene } from '../scenes/scene';
import { Framebuffer, createFramebuffer } from './gl-util';
import { ResourceManager } from '../managers/resource-manager';
import { Shader } from './shader';

export class Renderer {
  private postBufferPing: Framebuffer;
  private postBufferPong: Framebuffer;
  private postShader: Shader;

  constructor(gl: WebGL2RenderingContext, resourceManager: ResourceManager) {
    this.postBufferPing = createFramebuffer(gl);
    this.postBufferPong = createFramebuffer(gl);
    this.postShader = resourceManager['post'];
  }

  stop = false;

  public render(gl: WebGL2RenderingContext, scene: Scene, _alpha: number): void {
    gl.bindFramebuffer(GL_FRAMEBUFFER, this.postBufferPing.buffer);
    gl.enable(GL_DEPTH_TEST);
    gl.enable(GL_CULL_FACE);
    const clearColor = scene.clearColor;
    gl.clearColor(clearColor[0], clearColor[1], clearColor[2], 1);
    gl.viewport(0, 0, Settings.resolution[0], Settings.resolution[1]);
    gl.clear(GL_DEPTH_BUFFER_BIT | GL_STENCIL_BUFFER_BIT | GL_COLOR_BUFFER_BIT);
    scene.render(gl);
    this._postProcess(gl);
  }

  private _postProcess(gl: WebGL2RenderingContext): void {
    gl.bindTexture(gl.TEXTURE_2D, this.postBufferPing.texture);
    gl.bindFramebuffer(GL_FRAMEBUFFER, null);
    this.postShader.enable(gl);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.disable(GL_DEPTH_TEST);
    gl.disable(GL_CULL_FACE);
    gl.drawArrays(GL_TRIANGLES, 0, 3);
  }
}
