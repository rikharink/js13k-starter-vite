import { NormalizedRgbColor, RgbColor } from '../math/color';
import { Sprite } from '../rendering/sprite';
import { Settings } from '../settings';
import { State } from '../state';
import { Percentage } from '../types';
import { Scene } from './scene';

export class LoaderScene implements Scene {
  public pointer: [x: number, y: number];
  public clearColor: RgbColor;
  public sprites: Sprite[];
  public progress: Percentage = 0;

  public canvas: HTMLCanvasElement = document.createElement('canvas');
  private context: CanvasRenderingContext2D;

  public constructor(clearColor: NormalizedRgbColor) {
    this.clearColor = clearColor;
    this.pointer = [0, 0];
    this.sprites = [];
    this.context = this.canvas.getContext('2d')!;
    this.canvas.width = Settings.resolution[0];
    this.canvas.height = Settings.resolution[1];
    this.canvas.style.position = 'absolute';
    this.context.fillStyle = '#000000';
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  public onPush(): void {
    document.getElementById('app')!.appendChild(this.canvas);
  }

  public onPop(): void {
    document.getElementById('app')!.removeChild(this.canvas);
  }

  public render(_gl: WebGL2RenderingContext): void {
    console.log('load render');
  }

  public getState(): State {
    return new State(this);
  }

  public tick(_gl: WebGL2RenderingContext): void {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const hw = this.canvas.width * 0.5;
    const hh = this.canvas.height * 0.5;
    console.log(hw, hh);
  }
}
