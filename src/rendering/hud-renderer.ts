import { ResourceManager } from '../managers/resource-manager';
import { RgbColor, rgbaString } from '../math/color';
import { identityMatrix } from '../math/matrix4x4';
import { Vector2 } from '../math/vector2';
import { canvasToTexture } from './gl-util';
import { Settings } from '../settings';
import { Milliseconds, Seconds } from '../types';
import {
  GL_BLEND,
  GL_ONE,
  GL_ONE_MINUS_SRC_ALPHA,
  GL_SRC_ALPHA,
  GL_TEXTURE3,
  GL_TEXTURE_2D,
  GL_TRIANGLES,
} from './gl-constants';
import { Renderer } from './renderer';
import { Shader } from './shaders/shader';

interface TextOptions {
  color: RgbColor;
  font: string;
}

export class HudRenderer implements Renderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private shader: Shader;

  constructor(resourceManager: ResourceManager) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = Settings.resolution[0];
    this.canvas.height = Settings.resolution[1];
    this.ctx = this.canvas.getContext('2d')!;
    this.shader = resourceManager.shaders.get('post')!;
  }

  begin(gl: WebGL2RenderingContext): void {
    gl.enable(GL_BLEND);
    gl.blendFunc(GL_SRC_ALPHA, GL_ONE);
    this.shader.enable(gl);
    gl.uniformMatrix4fv(this.shader['u_colorMatrix'], false, identityMatrix);
    gl.uniform4f(this.shader['u_offset'], 0, 0, 0, 1);
  }

  public draw(gl: WebGL2RenderingContext, now: Milliseconds): void {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, Settings.resolution[0], Settings.resolution[1]);
    this.drawText(secondsToHms(Math.floor(now / 1000)), [30, 30]);
    const today = new Date();
    this.drawText(`${today.getUTCFullYear()}-${today.getUTCMonth()}-${today.getUTCDay()}`, [
      30,
      Settings.resolution[1] - 42 - 30,
    ]);


    gl.uniform1i(this.shader['u_buffer'], 3);
    gl.activeTexture(GL_TEXTURE3);
    const hudTexture = this.getTexture(gl);
    gl.bindTexture(GL_TEXTURE_2D, hudTexture);
    gl.drawArrays(GL_TRIANGLES, 0, 3);
  }

  end(gl: WebGL2RenderingContext): void {
    gl.blendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
  }

  private getTexture(gl: WebGL2RenderingContext): WebGLTexture {
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
    const y = position[1] + (measure.actualBoundingBoxAscent - measure.actualBoundingBoxDescent);
    ctx.fillText(text, x, y);
  }
}

function secondsToHms(s: Seconds) {
  const hh = `${Math.floor(s / 3600)}`.padStart(2, '0');
  const mm = `${Math.floor((s % 3600) / 60)}`.padStart(2, '0');
  const ss = `${Math.floor((s % 3600) % 60)}`.padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}
