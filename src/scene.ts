import { NormalizedRgbColor } from './math/color';
import { State } from './state';

export interface Scene {
  pointer: [x: number, y: number];
  clearColor: NormalizedRgbColor;
  getState(): State;
}

export class BaseScene implements Scene {
  public pointer: [x: number, y: number];
  public clearColor: NormalizedRgbColor;

  public constructor(clearColor: NormalizedRgbColor) {
    this.clearColor = clearColor;
    this.pointer = [0, 0];
  }

  public getState(): State {
    return new State(this);
  }
}
