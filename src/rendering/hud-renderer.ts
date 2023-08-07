import { ResourceManager } from '../managers/resource-manager';
import { rgbaString } from '../math/color';
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

export class HudRenderer implements Renderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private shader: Shader;
  private texture: WebGLTexture;

  constructor(gl: WebGL2RenderingContext, resourceManager: ResourceManager) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = Settings.resolution[0];
    this.canvas.height = Settings.resolution[1];
    this.ctx = this.canvas.getContext('2d')!;
    this.shader = resourceManager.shaders.get('post')!;
    this.texture = gl.createTexture()!;
  }

  begin(gl: WebGL2RenderingContext): void {
    gl.enable(GL_BLEND);
    gl.blendFunc(GL_SRC_ALPHA, GL_ONE);
    this.shader.enable(gl);
    gl.uniformMatrix4fv(this.shader['u_colorMatrix'], false, identityMatrix);
    gl.uniform4f(this.shader['u_offset'], 0, 0, 0, 1);

    this.ctx.font = '42px sans-serif';
    this.ctx.fillStyle = rgbaString([255, 255, 255], 255);
  }

  public draw(gl: WebGL2RenderingContext, now: Milliseconds, count: number): void {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, Settings.resolution[0], Settings.resolution[1]);
    this.drawText(secondsToHms(Math.floor(now / 1000)), [30, 30]);
    const today = new Date();
    const year = today.getFullYear();
    const month = `${today.getMonth() + 1}`.padStart(2, '0');
    const day = `${today.getDate()}`.padStart(2, '0');
    
    this.drawText(`${year}-${month}-${day}`, [
      30,
      Settings.resolution[1] - 42 - 30,
    ]);

    this.drawText(`sprites: ${count}`, [Settings.resolution[0] - 30, 30]);

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
    return canvasToTexture(gl, this.canvas, this.texture);
  }

  private drawText(text: string, position: Vector2) {
    const measure = this.ctx.measureText(text);
    let x = position[0];
    if (position[0] + measure.actualBoundingBoxRight >= Settings.resolution[0]) {
      x -= measure.actualBoundingBoxRight - measure.actualBoundingBoxLeft;
    }
    const y = position[1] + (measure.actualBoundingBoxAscent - measure.actualBoundingBoxDescent);
    this.ctx.fillText(text, x, y);
  }
}

function secondsToHms(s: Seconds) {
  const hh = `${Math.floor(s / 3600)}`.padStart(2, '0');
  const mm = `${Math.floor((s % 3600) / 60)}`.padStart(2, '0');
  const ss = `${Math.floor((s % 3600) % 60)}`.padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}
