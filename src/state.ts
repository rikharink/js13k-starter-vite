import { NormalizedRgbColor } from './math/color';
import { Sprite } from './rendering/sprite';
import { Scene } from './scenes/scene';

export class State {
  clearColor: NormalizedRgbColor;
  pointer: [x: number, y: number];
  sprites: Sprite[];

  public constructor(scene: Scene) {
    this.clearColor = scene.clearColor;
    this.pointer = scene.pointer;
    this.sprites = scene.sprites;
  }

  public blend(_previous: State, _alpha: number): State {
    return this;
  }
}
