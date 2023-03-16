import { BaseScene } from './scene';

export class State {
  clearColor: string;
  pointer: [x: number, y: number];

  public constructor(scene: BaseScene) {
    this.clearColor = scene.clearColor;
    this.pointer = scene.pointer;
  }

  public blend(previous: State, alpha: number): State {
    console.log(previous, alpha);
    return this;
  }
}
