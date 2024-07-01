import { GL_BLEND, GL_TEXTURE0, GL_TEXTURE_2D, GL_TRIANGLES } from './gl-constants';
import { Settings } from '../settings';
import { Scene } from '../scenes/scene';
import { Framebuffer } from './framebuffer';
import { ResourceManager } from '../managers/resource-manager';
import { Milliseconds } from '../types';
import { SpriteRenderer } from './sprite-renderer';
import { Renderer } from './renderer';
import { PostEffect } from './post-effects/post-effect';
import { Texture } from '../textures/texture';
import { Shader } from './shaders/shader';
import { create } from '../math/matrix4x4';
export class MainRenderer implements Renderer {
  private sceneBuffer: Framebuffer;
  private resourceManager: ResourceManager;
  private spriteRenderer: SpriteRenderer;
  private fx: PostEffect[] = [];
  private bgTexture: Texture;
  private bgShader: Shader;

  constructor(gl: WebGL2RenderingContext, resourceManager: ResourceManager) {
    this.sceneBuffer = new Framebuffer(gl);
    this.resourceManager = resourceManager;
    this.spriteRenderer = new SpriteRenderer(resourceManager);
    this.spriteRenderer.initialize(gl);
    this.bgTexture = resourceManager.textures.get('bg')!;
    this.bgShader = resourceManager.shaders.get('post')!;
  }

  public begin(gl: WebGL2RenderingContext): void {
    this.fx = this.resourceManager.getAllPostEffects();
    this.sceneBuffer.bind(gl);
  }

  stop = false;

  public render(gl: WebGL2RenderingContext, scene: Scene, _alpha: number, time: Milliseconds): void {
    gl.viewport(0, 0, Settings.resolution[0], Settings.resolution[1]);

    this.bgShader.enable(gl);
    gl.activeTexture(GL_TEXTURE0);
    gl.bindTexture(GL_TEXTURE_2D, this.bgTexture.texture);
    gl.uniformMatrix4fv(this.bgShader['u_colorMatrix'], false, create());
    gl.uniform4f(this.bgShader['u_offset'], 0, 0, 0, 1);
    gl.uniform4f(this.bgShader['u_colorFilter'], 1, 1, 1, 1);
    gl.uniform1i(this.bgShader['u_buffer'], 0);
    gl.drawArrays(GL_TRIANGLES, 0, 3);

    this.spriteRenderer.begin(gl, scene.camera);
    for (const sprite of scene.sprites) {
      this.spriteRenderer.drawSprite(gl, sprite);
    }
    this.spriteRenderer.end(gl);

    if (this.fx.length === 0) {
      return;
    }

    gl.disable(GL_BLEND);
    let input = this.sceneBuffer;
    this.sceneBuffer.bind(gl);
    for (const fx of this.fx) {
      const result = fx.apply(gl, input, time);
      if (result != null) {
        input = result;
      }
    }
  }

  public end(_gl: WebGL2RenderingContext): void {}
}
