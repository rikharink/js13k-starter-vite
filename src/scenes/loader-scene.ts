import { ResourceManager } from '../managers/resource-manager';
import { SceneManager } from '../managers/scene-manager';
import { rgbaString } from '../math/color';
import { AABB } from '../math/geometry/aabb';
import { BASE00, BASE02, BASE05 } from '../palette';
import { Camera } from '../rendering/camera';
import { Sprite } from '../rendering/sprite';
import { Settings } from '../settings';
import { Percentage } from '../types';
import { Background, Scene } from './scene';

export class LoaderScene implements Scene {
  public name = 'loader';
  public sceneTime: number = 0;
  public bg: Background = { type: 'color', color: [1, 1, 1, 1] };
  public sprites: Sprite[] = [];
  public bounds: AABB = {
    min: [0, 0],
    max: [Settings.resolution[0], Settings.resolution[1]],
  };

  public progress: Percentage = 0;
  public trauma: number = 0;
  public camera: Camera = null!;
  public traumaDampening: number = 0;

  public canvas: HTMLCanvasElement = document.createElement('canvas');
  private ctx: CanvasRenderingContext2D;
  private running = false;

  public constructor() {
    this.ctx = this.canvas.getContext('2d')!;
    this.canvas.width = Settings.resolution[0];
    this.canvas.height = Settings.resolution[1];
    this.canvas.style.position = 'absolute';
  }

  public sceneManager!: SceneManager;
  public resourceManager!: ResourceManager;

  public onPush(): void {
    this.running = true;
    document.getElementById('app')!.appendChild(this.canvas);
    requestAnimationFrame(this.loadLoop.bind(this));
  }

  public onPop(): void {
    this.running = false;
    document.getElementById('app')!.removeChild(this.canvas);
    console.debug(`Scene ${this.name} ran for ${this.sceneTime}ms`);
  }

  public loadLoop(now: number) {
    if (!this.running) return;
    this.sceneTime = now;
    requestAnimationFrame(this.loadLoop.bind(this));

    const ctx = this.ctx;
    ctx.fillStyle = rgbaString(BASE00, 255);
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (now < Settings.minLoadingTimeMs) return;

    const hw = this.canvas.width * 0.5;
    const hh = this.canvas.height * 0.5;

    ctx.font = '72px sans-serif';
    ctx.fillStyle = rgbaString(BASE05, 255);
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
    ctx.fillStyle = rgbaString(BASE05, 255);
    ctx.fillRect(x, y, mw, mh);
    ctx.fillStyle = rgbaString(BASE02, 255);
    ctx.fillRect(x, y, mw * s, mh);
  }

  public fixedTick(): void {}

  public variableTick(): void {}
  
}
