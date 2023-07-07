import { rng } from '../game';
import { ResourceManager } from '../managers/resource-manager';
import { NormalizedRgbColor } from '../math/color';
import { Shader } from '../rendering/shader';
import { Sprite } from '../rendering/sprite';
import { Settings } from '../settings';
import { State } from '../state';
import { Scene } from './scene';

export class BaseScene implements Scene {
  public pointer: [x: number, y: number];
  public clearColor: NormalizedRgbColor;
  public sprites: Sprite[];
  private spriteShader: Shader;

  public constructor(clearColor: NormalizedRgbColor, resourceManager: ResourceManager) {
    this.clearColor = clearColor;
    this.pointer = [0, 0];
    this.sprites = [];
    this.spriteShader = resourceManager['sprite'];
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public onPush(): void {}
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public onPop(): void {}

  public tick(gl: WebGL2RenderingContext): void {
    this.sprites.push(
      new Sprite(
        gl,
        this.spriteShader,
        [10, 10],
        [rng() * Settings.resolution[0], rng() * Settings.resolution[1]],
        [255 * rng(), 255 * rng(), 255 * rng()]
      )
    );
  }

  public render(gl: WebGL2RenderingContext): void {
    this.spriteShader.enable(gl);
    for (const sprite of this.sprites) {
      sprite.render(gl);
    }
  }

  public getState(): State {
    return new State(this);
  }
}
