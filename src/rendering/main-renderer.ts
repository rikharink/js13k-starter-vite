import { GL_COLOR_BUFFER_BIT, GL_DEPTH_BUFFER_BIT } from './gl-constants';
import { Settings } from '../settings';
import { Scene } from '../scenes/scene';
import { Framebuffer } from './framebuffer';
import { ResourceManager } from '../managers/resource-manager';
import { Milliseconds } from '../types';
import { SpriteRenderer } from './sprite-renderer';
import { Renderer } from './renderer';
import { HudRenderer } from './hud-renderer';

export class MainRenderer implements Renderer {
  private sceneBuffer: Framebuffer;
  private resourceManager: ResourceManager;
  private spriteRenderer: SpriteRenderer;
  private hudRenderer: HudRenderer;

  constructor(gl: WebGL2RenderingContext, resourceManager: ResourceManager) {
    this.sceneBuffer = new Framebuffer(gl);
    this.resourceManager = resourceManager;
    this.spriteRenderer = new SpriteRenderer(resourceManager);
    this.hudRenderer = new HudRenderer(resourceManager);
  }

  public begin(_gl: WebGL2RenderingContext): void {}

  stop = false;

  public render(gl: WebGL2RenderingContext, scene: Scene, _alpha: number, time: Milliseconds): void {
    this.sceneBuffer.enable(gl);
    const clearColor = Settings.clearColor;
    gl.clearColor(clearColor[0], clearColor[1], clearColor[2], 1);
    gl.viewport(0, 0, Settings.resolution[0], Settings.resolution[1]);
    gl.clear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

    for (const sprite of scene.sprites) {
      this.spriteRenderer.drawSprite(gl, sprite);
    }

    this.hudRenderer.begin(gl);
    this.hudRenderer.draw(gl, time);
    this.hudRenderer.end(gl);

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
