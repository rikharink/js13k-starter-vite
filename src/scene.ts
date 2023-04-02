import { rng } from './game';
import { ResourceManager } from './managers/resource-manager';
import { NormalizedRgbColor, RgbColor } from './math/color';
import { Shader } from './rendering/shader';
import { Sprite } from './rendering/sprite';
import { Settings } from './settings';
import { State } from './state';

export interface Scene {
  pointer: [x: number, y: number];
  clearColor: NormalizedRgbColor;
  sprites: Sprite[];
  getState(): State;
  tick(gl: WebGL2RenderingContext): void;
}

export class LoaderScene implements Scene {
  pointer: [x: number, y: number] = [0, 0];
  sprites: Sprite[] = [];
  clearColor: RgbColor;
  progress = 0;

  public constructor(clearColor: RgbColor) {
    this.clearColor = clearColor;
  }

  public init(gl: WebGL2RenderingContext, resourceManager: ResourceManager): void {
    const shader = resourceManager['sprite'];
    const width = (Settings.resolution[0] / 2) * 0.9;
    const height = 40;
    const x = gl.canvas.width / 2;
    const y = gl.canvas.height / 2 - height / 2;

    this.sprites.push(
      new Sprite(gl, shader, [(width - 4) * this.progress, height - 4], [x, y], [rng() * 255, rng() * 255, rng() * 255])
    );
    this.sprites.push(new Sprite(gl, shader, [width, height], [x, y], [255, 255, 255]));
  }

  public getState(): State {
    return new State(this);
  }

  public tick(_gl: WebGL2RenderingContext): void {
    return;
  }
}

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
    if (this.sprites.length % 10 === 0) {
      console.log('Sprite count:', this.sprites.length);
    }
  }

  public getState(): State {
    return new State(this);
  }
}
