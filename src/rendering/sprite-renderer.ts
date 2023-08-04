import { ResourceManager } from '../managers/resource-manager';
import { Settings } from '../settings';
import { Camera } from './camera';
import {
  GL_ARRAY_BUFFER,
  GL_BLEND,
  GL_FLOAT,
  GL_ONE_MINUS_SRC_ALPHA,
  GL_SRC_ALPHA,
  GL_TEXTURE2,
  GL_TEXTURE_2D,
  GL_TRIANGLES,
  GL_UNSIGNED_SHORT,
} from './gl-constants';
import { createArrayBuffer, createIndexBuffer } from './gl-util';
import { Renderer } from './renderer';
import { Shader } from './shaders/shader';
import { Sprite } from './sprite';

const MAX_SPRITES_PER_BATCH = 1_000;
const FLOATS_PER_VERTEX = 7;
const FLOATS_PER_SPRITE = 4 * FLOATS_PER_VERTEX;
const INDICES_PER_SPRITE = 6;

export class SpriteRenderer implements Renderer {
  private currentTexture: WebGLTexture | null = null;
  private instanceCount = 0;
  private camera!: Camera;

  private indexBuffer!: WebGLBuffer;
  private buffer!: WebGLBuffer;

  private shader: Shader;
  private data: Float32Array = new Float32Array(FLOATS_PER_SPRITE * MAX_SPRITES_PER_BATCH);

  constructor(resourceManager: ResourceManager) {
    this.shader = resourceManager.shaders.get('sprite')!;
    this.camera = new Camera([Settings.resolution[0], Settings.resolution[1]]);
  }

  public initialize(gl: WebGL2RenderingContext) {
    this.shader.enable(gl);
    this.buffer = createArrayBuffer(gl, this.data, false);

    const stride =
      2 * Float32Array.BYTES_PER_ELEMENT + 2 * Float32Array.BYTES_PER_ELEMENT + 3 * Float32Array.BYTES_PER_ELEMENT;

    gl.vertexAttribPointer(0, 2, GL_FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(0);

    gl.vertexAttribPointer(1, 2, GL_FLOAT, false, stride, 2 * Float32Array.BYTES_PER_ELEMENT);
    gl.enableVertexAttribArray(1);

    gl.vertexAttribPointer(2, 3, GL_FLOAT, false, stride, 4 * Float32Array.BYTES_PER_ELEMENT);
    gl.enableVertexAttribArray(2);

    this.setupIndexBuffer(gl);
  }

  private setupIndexBuffer(gl: WebGL2RenderingContext) {
    const data = new Uint16Array(MAX_SPRITES_PER_BATCH * INDICES_PER_SPRITE);

    for (let i = 0; i < MAX_SPRITES_PER_BATCH; i++) {
      // t1
      data[i * INDICES_PER_SPRITE + 0] = i * 4 + 0;
      data[i * INDICES_PER_SPRITE + 1] = i * 4 + 1;
      data[i * INDICES_PER_SPRITE + 2] = i * 4 + 3;

      // 2
      data[i * INDICES_PER_SPRITE + 3] = i * 4 + 1;
      data[i * INDICES_PER_SPRITE + 4] = i * 4 + 2;
      data[i * INDICES_PER_SPRITE + 5] = i * 4 + 3;
    }

    this.indexBuffer = createIndexBuffer(gl, data);
  }

  begin(gl: WebGL2RenderingContext): void {
    this.shader.enable(gl);
    this.camera.update();
    this.instanceCount = 0;

    gl.enable(GL_BLEND);
    gl.blendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);

    gl.uniformMatrix4fv(this.shader['u_projectionViewMatrix'], false, this.camera.projectionViewMatrix);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
  }

  drawSprite(gl: WebGL2RenderingContext, sprite: Sprite): void {
    if (this.currentTexture !== sprite.texture) {
      this.end(gl);
      gl.activeTexture(GL_TEXTURE2);
      gl.bindTexture(GL_TEXTURE_2D, sprite.texture.texture);
      this.currentTexture = sprite.texture;
    }
    let i = this.instanceCount * FLOATS_PER_SPRITE;
    
    const u0 = sprite.sourceRect.position[0] / sprite.texture.size[0];
    const u1 = (sprite.sourceRect.position[0] + sprite.sourceRect.size[0]) / sprite.texture.size[0];
    const v0 = 1 - (sprite.sourceRect.position[1] + sprite.sourceRect.size[1]) / sprite.texture.size[1];
    const v1 = 1 - sprite.sourceRect.position[1] / sprite.texture.size[1];

    // top left
    this.data[0 + i] = sprite.drawRect.position[0]; // x
    this.data[1 + i] = sprite.drawRect.position[1]; // y
    this.data[2 + i] = u0; // u
    this.data[3 + i] = v1; // v
    this.data[4 + i] = sprite.color[0]; // r
    this.data[5 + i] = sprite.color[1]; // g
    this.data[6 + i] = sprite.color[2]; // b

    // top right
    this.data[7 + i] = sprite.drawRect.position[0] + sprite.drawRect.size[0]; // x
    this.data[8 + i] = sprite.drawRect.position[1]; // y
    this.data[9 + i] = u1; // u
    this.data[10 + i] = v1; // v
    this.data[11 + i] = sprite.color[0]; // r
    this.data[12 + i] = sprite.color[1]; // g
    this.data[13 + i] = sprite.color[2]; // b

    // bottom right
    this.data[14 + i] = sprite.drawRect.position[0] + sprite.drawRect.size[0]; // x
    this.data[15 + i] = sprite.drawRect.position[1] + sprite.drawRect.size[1]; // y
    this.data[16 + i] = u1; // u
    this.data[17 + i] = v0; // v
    this.data[18 + i] = sprite.color[0]; // r
    this.data[19 + i] = sprite.color[1]; // g
    this.data[20 + i] = sprite.color[2]; // b

    // bottom left
    this.data[21 + i] = sprite.drawRect.position[0]; // x
    this.data[22 + i] = sprite.drawRect.position[1] + sprite.drawRect.size[1]; // y
    this.data[23 + i] = u0; // u
    this.data[24 + i] = v0; // v
    this.data[25 + i] = sprite.color[0]; // r
    this.data[26 + i] = sprite.color[1]; // g
    this.data[27 + i] = sprite.color[2]; // b

    this.instanceCount++;
    if (this.instanceCount >= MAX_SPRITES_PER_BATCH) {
      this.end(gl);
    }
  }

  end(gl: WebGL2RenderingContext): void {
    gl.bufferSubData(GL_ARRAY_BUFFER, 0, this.data);
    gl.uniform1i(this.shader['u_texture'], 2);
    gl.drawElements(GL_TRIANGLES, 6 * this.instanceCount, GL_UNSIGNED_SHORT, 0);

    this.instanceCount = 0;
  }
}
