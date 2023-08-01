import {
  GL_BLEND,
  GL_COLOR_BUFFER_BIT,
  GL_CULL_FACE,
  GL_DEPTH_TEST,
  GL_ONE,
  GL_SRC_ALPHA,
  GL_TEXTURE_2D,
  GL_TRIANGLES,
  GL_UNPACK_FLIP_Y_WEBGL,
} from './gl-constants';
import { Settings } from '../settings';
import { Scene } from '../scenes/scene';
import { Framebuffer } from './framebuffer';
import { ResourceManager } from '../managers/resource-manager';
import { Milliseconds } from '../types';
import { hud } from '../game';
import { Shader } from './shaders/shader';
import { create } from '../math/matrix4x4';

export class Renderer {
  private sceneBuffer: Framebuffer;
  private resourceManager: ResourceManager;
  private shader: Shader;

  constructor(gl: WebGL2RenderingContext, resourceManager: ResourceManager) {
    this.sceneBuffer = new Framebuffer(gl);
    this.resourceManager = resourceManager;
    this.shader = resourceManager.shaders.get('post')!;
  }

  stop = false;

  public render(gl: WebGL2RenderingContext, scene: Scene, _alpha: number, time: Milliseconds): void {
    this.sceneBuffer.enable(gl);
    gl.disable(GL_DEPTH_TEST);
    gl.disable(GL_CULL_FACE);
    const clearColor = scene.clearColor;
    gl.clearColor(clearColor[0], clearColor[1], clearColor[2], 1);
    gl.viewport(0, 0, Settings.resolution[0], Settings.resolution[1]);
    gl.clear(GL_COLOR_BUFFER_BIT);
    scene.render(gl);

    gl.pixelStorei(GL_UNPACK_FLIP_Y_WEBGL, true);
    gl.blendFunc(GL_SRC_ALPHA, GL_ONE);
    gl.enable(GL_BLEND);
    this.shader.enable(gl);
    const hudTexture = hud.getTexture(gl);
    gl.uniformMatrix4fv(this.shader['u_colorMatrix'], false, create());
    gl.uniform4f(this.shader['u_offset'], 0, 0, 0, 1);
    gl.bindTexture(GL_TEXTURE_2D, hudTexture);
    gl.drawArrays(GL_TRIANGLES, 0, 3);
    gl.disable(GL_BLEND);
    gl.pixelStorei(GL_UNPACK_FLIP_Y_WEBGL, false);

    let input = this.sceneBuffer;
    for (const fx of this.resourceManager.getAllPostEffects()) {
      const result = fx.apply(gl, input, time);
      if (result != null) {
        input = result;
      }
    }
  }
}
