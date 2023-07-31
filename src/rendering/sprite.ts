import { create, multiply, ortho, scale } from '../math/matrix4x4';
import { Vector2 } from '../math/vector2';
import { Mesh } from './mesh/mesh';
import { Quad } from './mesh/quad';
import { Renderable } from './renderable';
import { Shader } from './shaders/shader';
import { NormalizedRgbaColor, normalizeRgb, RgbColor } from '../math/color';
import { GL_TEXTURE0, GL_TEXTURE_2D } from './gl-constants';
import { generateSolidTexture } from './textures';

export class Sprite implements Renderable {
  public size: Vector2;
  public position: Vector2;
  public anchor: Vector2;
  public texture: WebGLTexture;
  public color: NormalizedRgbaColor;
  private mesh: Mesh;
  private textureUnit: number;
  private shader: Shader;

  public constructor(
    gl: WebGL2RenderingContext,
    shader: Shader,
    size: Vector2,
    position: Vector2,
    color: RgbColor,
    anchor?: Vector2,
    texture?: WebGLTexture,
    textureUnit?: number,
  ) {
    this.shader = shader;
    this.size = size;
    this.position = position;
    this.anchor = anchor ?? [0, 0];
    this.mesh = new Quad(gl, this.shader);
    this.textureUnit = textureUnit ?? 0;
    this.color = [...normalizeRgb(color), 1];
    this.texture = texture ?? generateSolidTexture(gl, [255, 255, 255]);
  }

  render(gl: WebGL2RenderingContext): void {
    const projectionMatrix = ortho(create(), 0, gl.drawingBufferWidth, gl.drawingBufferHeight, 0, -1, 1);
    const modelMatrix = create();
    const viewMatrix = create();
    scale(modelMatrix, modelMatrix, [...this.size, 1]);

    const mvpMatrix = create();
    multiply(mvpMatrix, projectionMatrix, viewMatrix);
    multiply(mvpMatrix, mvpMatrix, modelMatrix);

    gl.uniformMatrix4fv(this.shader['u_mvpMatrix'], false, mvpMatrix);

    gl.uniform4fv(this.shader['u_blend'], this.color);
    gl.uniform1i(this.shader['u_atlas'], this.textureUnit);
    gl.activeTexture(GL_TEXTURE0 + this.textureUnit);
    gl.bindTexture(GL_TEXTURE_2D, this.texture);
    this.mesh.render(gl);
  }
}
