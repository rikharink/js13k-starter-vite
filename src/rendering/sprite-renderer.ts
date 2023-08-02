import { ResourceManager } from '../managers/resource-manager';
import { Renderer } from './renderer';
import { Shader } from './shaders/shader';
import { Sprite } from './sprite';

const MAX_SPRITES_PER_BATCH = 1000;

export class SpriteRenderer implements Renderer {
  private currentTexture!: WebGLTexture;
  private i = 0;

  //private vertices = new Float32Array();
  //private indices = new Uint16Array();

  private shader: Shader;

  constructor(resourceManager: ResourceManager) {
    this.shader = resourceManager.shaders.get('sprite')!;
  }

  begin(gl: WebGL2RenderingContext): void {
    this.shader.enable(gl);
    this.i = 0;
  }

  drawSprite(gl: WebGL2RenderingContext, sprite: Sprite): void {
    if (this.currentTexture !== sprite.texture) {
      this.currentTexture = sprite.texture;
      this.end(gl);
    }

    this.i++;
    if (this.i >= MAX_SPRITES_PER_BATCH) {
      this.end(gl);
    }
  }

  end(_gl: WebGL2RenderingContext): void {
    this.i = 0;
  }
}
