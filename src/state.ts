import { NormalizedRgbColor } from './math/color';
import { BaseScene } from './scene';

export class State {
  clearColor: NormalizedRgbColor;
  pointer: [x: number, y: number];

  public constructor(scene: BaseScene) {
    this.clearColor = scene.clearColor;
    this.pointer = scene.pointer;
  }

  public blend(_previous: State, _alpha: number): State {
    return this;
  }
}
