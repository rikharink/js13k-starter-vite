import { ResourceManager } from '../../managers/resource-manager';
import { NormalizedRgbaColor } from '../../math/color';
import { Matrix4x4, create, multiply, transpose } from '../../math/matrix4x4';
import { Vector4, add } from '../../math/vector4';
import { Seconds } from '../../types';
import { Framebuffer } from '../framebuffer';
import { PostEffect } from './post-effect';

export class ColorCorrection extends PostEffect {
  public brightness: number = 0;
  public contrast: number = 0;
  public exposure: number = 0;
  public saturation: number = 0;
  public colorFilter: NormalizedRgbaColor = [1, 1, 1, 1];

  public constructor(gl: WebGL2RenderingContext, resourceManager: ResourceManager) {
    super('color correction', gl, resourceManager.shaders.get('post')!);
    super.isEnabled = true;
  }

  public apply(gl: WebGL2RenderingContext, input: Framebuffer, time: Seconds): Framebuffer | null {
    if (!this.isEnabled) return input;
    this.shader.enable(gl);

    const brightnessMatrix = create();
    const brightnessOffset: Vector4 = [this.brightness, this.brightness, this.brightness, 0];

    const c = 1 + this.contrast;
    const o = 0.5 * (1 - c);
    const contrastMatrix: Matrix4x4 = [c, 0, 0, 0, 0, c, 0, 0, 0, 0, c, 0, 0, 0, 0, 1];
    const contrastOffset: Vector4 = [o, o, o, 0];

    const e = 1 + this.exposure;
    const exposureMatrix: Matrix4x4 = [e, 0, 0, 0, 0, e, 0, 0, 0, 0, e, 0, 0, 0, 0, 1];
    transpose(exposureMatrix, exposureMatrix);

    const lr = 0.2126;
    const lg = 0.7152;
    const lb = 0.0722;

    const s = 1 + this.saturation;
    const sr = (1 - s) * lr;
    const sg = (1 - s) * lg;
    const sb = (1 - s) * lb;

    const saturationMatrix: Matrix4x4 = [sr + s, sg, sb, 0, sr, sg + s, sb, 0, sr, sg, sb + s, 0, 0, 0, 0, 1];
    transpose(saturationMatrix, saturationMatrix);

    const colorMatrix = brightnessMatrix;
    multiply(colorMatrix, colorMatrix, contrastMatrix);
    multiply(colorMatrix, colorMatrix, exposureMatrix);
    multiply(colorMatrix, colorMatrix, saturationMatrix);

    const colorOffset = brightnessOffset;
    add(colorOffset, colorOffset, contrastOffset);

    gl.uniformMatrix4fv(this.shader['u_colorMatrix'], false, colorMatrix);
    gl.uniform4f(this.shader['u_offset'], ...colorOffset);
    gl.uniform4f(this.shader['u_colorFilter'], ...this.colorFilter);
    this.render(gl, input, time);

    return this.output;
  }
}
