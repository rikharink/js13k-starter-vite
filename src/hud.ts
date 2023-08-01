import { RgbColor, rgbaString } from './math/color';
import { Vector2 } from './math/vector2';
import { canvasToTexture } from './rendering/gl-util';
import { Settings } from './settings';
import { Tickable } from './tickable';
import { Milliseconds, Seconds } from './types';

interface TextOptions {
  color: RgbColor;
  font: string;
}

export class Hud implements Tickable {
  private ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = Settings.resolution[0];
    this.canvas.height = Settings.resolution[1];
    this.ctx = this.canvas.getContext('2d')!;
  }

  public render(now: Milliseconds): void {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, Settings.resolution[0], Settings.resolution[1]);
    this.drawText(secondsToHms(Math.floor(now / 1000)), [30, 30]);
  }

  public getTexture(gl: WebGL2RenderingContext): WebGLTexture {
    return canvasToTexture(gl, this.canvas);
  }

  private drawText(
    text: string,
    position: Vector2,
    options: TextOptions = {
      color: [255, 255, 255],
      font: '42px sans-serif',
    },
  ) {
    const ctx = this.ctx;
    ctx.font = options.font;
    ctx.fillStyle = rgbaString(options.color, 255);
    const measure = ctx.measureText(text);
    const x = position[0];
    const y = measure.actualBoundingBoxAscent - measure.actualBoundingBoxDescent + position[1];
    ctx.fillText(text, x, y);
  }
}

function secondsToHms(s: Seconds) {
  const hh = `${Math.floor(s / 3600)}`.padStart(2, '0');
  const mm = `${Math.floor((s % 3600) / 60)}`.padStart(2, '0');
  const ss = `${Math.floor((s % 3600) % 60)}`.padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}
