import { Sprite } from '../rendering/sprite';
import { Scene } from './scene';

export class BaseScene implements Scene {
  public name = 'base scene';
  public sprites: Sprite[];

  public constructor() {
    this.sprites = [];
  }

  public onPush(): void {
    console.debug(`pushed scene: ${this.name}`);
  }

  public onPop(): void {
    console.debug(`popped scene: ${this.name}`);
  }

  public tick(): void {}
}
