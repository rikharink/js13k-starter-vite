import frag from './default.frag?raw';
import vert from './default.vert?raw';
import { create, ortho, scale, translate } from '../math/matrix4x4';
import { Vector2 } from '../math/vector2';
import { initShaderProgram } from './gl-util';
import { Mesh } from './mesh/mesh';
import { Quad } from './mesh/quad';
import { Renderable } from './renderable';
import { Shader } from './shader';
import { NormalizedRgbaColor, normalizeRgb, RgbColor } from '../math/color';
import { GL_TEXTURE0, GL_TEXTURE_2D } from './gl-constants';
import { generateSolidTexture } from './textures';

//TODO: texture atlas support (finish texture matrix setup)
//TODO: test with actual texture
export class Sprite implements Renderable {
  public size: Vector2;
  public position: Vector2;
  public texture: WebGLTexture;
  public color: NormalizedRgbaColor;
  private mesh: Mesh;
  private shader: Shader;
  private textureUnit: number;

  public constructor(
    gl: WebGL2RenderingContext,
    size: Vector2,
    position: Vector2,
    color: RgbColor,
    texture?: WebGLTexture,
    textureUnit?: number
  ) {
    this.shader = initShaderProgram(gl, vert, frag)!;
    this.size = size;
    this.position = position;
    this.mesh = new Quad(gl, this.shader);
    this.textureUnit = textureUnit ?? 0;
    this.color = [...normalizeRgb(color), 1];
    this.texture = texture ?? generateSolidTexture(gl, [255, 255, 255]);
  }

  render(gl: WebGL2RenderingContext): void {
    this.shader.enable(gl);
    const mat = ortho(create(), 0, gl.canvas.width, gl.canvas.height, 0, -1, 1);
    translate(mat, mat, [...this.position, 0]);
    scale(mat, mat, [...this.size, 1]);
    gl.uniformMatrix4fv(this.shader['matrix'], false, mat);

    const tmat = create();
    translate(tmat, tmat, [1, 1, 0]);
    scale(tmat, tmat, [...this.size, 1]);
    gl.uniformMatrix4fv(this.shader['tmatrix'], false, tmat);

    gl.uniform4fv(this.shader['color'], this.color);
    gl.uniform1i(this.shader['tex'], this.textureUnit);
    gl.activeTexture(GL_TEXTURE0 + this.textureUnit);
    gl.bindTexture(GL_TEXTURE_2D, this.texture);
    this.mesh.render(gl);
  }
}
