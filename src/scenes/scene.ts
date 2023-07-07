import { NormalizedRgbColor } from '../math/color';
import { Sprite } from '../rendering/sprite';
import { State } from '../state';

export interface Scene {
  pointer: [x: number, y: number];
  clearColor: NormalizedRgbColor;
  sprites: Sprite[];
  getState(): State;
  render(gl: WebGL2RenderingContext): void;
  tick(gl: WebGL2RenderingContext): void;
  onPush(): void;
  onPop(): void;
}
