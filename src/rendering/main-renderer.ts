import { GL_BLEND, GL_COLOR_BUFFER_BIT, GL_DEPTH_BUFFER_BIT, GL_DEPTH_TEST } from './gl-constants';
import { Settings } from '../settings';
import { Scene } from '../scenes/scene';
import { Framebuffer } from './framebuffer';
import { ResourceManager } from '../managers/resource-manager';
import { Milliseconds } from '../types';
import { SpriteRenderer } from './sprite-renderer';
import { Renderer } from './renderer';
import { HudRenderer } from './hud-renderer';
import { Camera } from './camera';

export class MainRenderer implements Renderer {
  private sceneBuffer: Framebuffer;
  private resourceManager: ResourceManager;
  private spriteRenderer: SpriteRenderer;
  private hudRenderer: HudRenderer;

  constructor(gl: WebGL2RenderingContext, resourceManager: ResourceManager, camera: Camera) {
    this.sceneBuffer = new Framebuffer(gl);
    this.resourceManager = resourceManager;
    this.spriteRenderer = new SpriteRenderer(resourceManager, camera);
    this.spriteRenderer.initialize(gl);
    this.hudRenderer = new HudRenderer(gl, resourceManager);
  }

  public begin(gl: WebGL2RenderingContext): void {
    this.sceneBuffer.enable(gl);
    gl.enable(GL_DEPTH_TEST);
  }

  stop = false;

  public render(gl: WebGL2RenderingContext, scene: Scene, _alpha: number, time: Milliseconds): void {
    const clearColor = Settings.clearColor;
    gl.clearColor(clearColor[0], clearColor[1], clearColor[2], 1);
    gl.viewport(0, 0, Settings.resolution[0], Settings.resolution[1]);
    gl.clear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

    this.spriteRenderer.begin(gl);
    for (const sprite of scene.sprites) {
      this.spriteRenderer.drawSprite(gl, sprite);
    }
    this.spriteRenderer.end(gl);

    this.hudRenderer.begin(gl);
    this.hudRenderer.draw(gl, time, scene.sprites.length);
    this.hudRenderer.end(gl);

    gl.disable(GL_BLEND);
    let input = this.sceneBuffer;
    for (const fx of this.resourceManager.getAllPostEffects()) {
      const result = fx.apply(gl, input, time);
      if (result != null) {
        input = result;
      }
    }
  }

  public end(_gl: WebGL2RenderingContext): void {}
}
