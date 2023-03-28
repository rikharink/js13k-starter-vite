import { rng } from './game';
import { NormalizedRgbColor } from './math/color';
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

export class BaseScene implements Scene {
  public pointer: [x: number, y: number];
  public clearColor: NormalizedRgbColor;
  public sprites: Sprite[];

  public constructor(clearColor: NormalizedRgbColor) {
    this.clearColor = clearColor;
    this.pointer = [0, 0];
    this.sprites = [];
  }

  public tick(gl: WebGL2RenderingContext): void {
    this.sprites.push(
      new Sprite(
        gl,
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
