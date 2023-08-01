import { NormalizedRgbColor, RgbColor } from '../math/color';
import { Sprite } from '../rendering/sprite';
import { Settings } from '../settings';
import { State } from '../state';
import { Percentage } from '../types';
import { Scene } from './scene';

export class LoaderScene implements Scene {
  public name = 'loader';
  public pointer: [x: number, y: number];
  public clearColor: RgbColor;
  public sprites: Sprite[];
  public progress: Percentage = 0;

  public canvas: HTMLCanvasElement = document.createElement('canvas');
  private ctx: CanvasRenderingContext2D;
  private raf!: number;
  private running = false;

  public constructor(clearColor: NormalizedRgbColor) {
    this.clearColor = clearColor;
    this.pointer = [0, 0];
    this.sprites = [];
    this.ctx = this.canvas.getContext('2d')!;
    this.canvas.width = Settings.resolution[0];
    this.canvas.height = Settings.resolution[1];
    this.canvas.style.position = 'absolute';
  }

  public onPush(): void {
    this.running = true;
    document.getElementById('app')!.appendChild(this.canvas);
    requestAnimationFrame(this.loadLoop.bind(this));
  }

  public onPop(): void {
    this.running = false;
    document.getElementById('app')!.removeChild(this.canvas);
    cancelAnimationFrame(this.raf);
  }

  public render(_gl: WebGL2RenderingContext): void {}

  public getState(): State {
    return new State(this);
  }

  public loadLoop(now: number) {
    if (!this.running) return;
    requestAnimationFrame(this.loadLoop.bind(this));

    const ctx = this.ctx;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (now < Settings.minLoadingTimeMs) return;

    const hw = this.canvas.width * 0.5;
    const hh = this.canvas.height * 0.5;

    ctx.font = '72px sans-serif';
    ctx.fillStyle = '#FFFFFF';
    const text = 'LOADING...';
    const measure = ctx.measureText(text);
    const tx = hw - (measure.actualBoundingBoxRight - measure.actualBoundingBoxLeft) * 0.5;
    const ty = measure.actualBoundingBoxAscent - measure.actualBoundingBoxDescent + hh - 150;
    ctx.fillText(text, tx, ty);

    const mw = hw;
    const mh = 100;
    const s = this.progress / 100;

    const x = hw - mw * 0.5;
    const y = hh - mh * 0.5;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x, y, mw, mh);
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(x, y, mw * s, mh);
  }

  public tick(_gl: WebGL2RenderingContext): void {}
}
