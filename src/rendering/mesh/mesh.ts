import {
  GL_ARRAY_BUFFER,
  GL_ELEMENT_ARRAY_BUFFER,
  GL_FLOAT,
  GL_STATIC_DRAW,
  GL_TRIANGLES,
  GL_UNSIGNED_SHORT,
} from '../gl-constants';
import { Renderable } from '../renderable';
import { Shader } from '../shaders/shader';

export abstract class Mesh implements Renderable {
  protected vao: WebGLVertexArrayObject;
  protected vertices: Float32Array;
  protected indices: Uint16Array;
  vertexBuffer: WebGLBuffer;
  indexBuffer: WebGLBuffer;
  uvBuffer: WebGLBuffer;

  protected constructor(gl: WebGL2RenderingContext, vertices: Float32Array, indices: Uint16Array, material: Shader) {
    this.vao = gl.createVertexArray()!;
    gl.bindVertexArray(this.vao);
    this.vertices = vertices;
    this.indices = indices;
    this.vertexBuffer = gl.createBuffer()!;
    this.indexBuffer = gl.createBuffer()!;
    this.uvBuffer = gl.createBuffer()!;
    gl.bindBuffer(GL_ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(GL_ARRAY_BUFFER, this.vertices, GL_STATIC_DRAW);
    gl.bindBuffer(GL_ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(GL_ELEMENT_ARRAY_BUFFER, this.indices, GL_STATIC_DRAW);
    gl.bindBuffer(GL_ARRAY_BUFFER, this.uvBuffer);
    const pos = material['a_position'];
    const uv = material['a_texcoord'];
    gl.vertexAttribPointer(pos, 2, GL_FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 0);
    gl.vertexAttribPointer(
      uv,
      2,
      GL_FLOAT,
      false,
      4 * Float32Array.BYTES_PER_ELEMENT,
      2 * Float32Array.BYTES_PER_ELEMENT,
    );

    gl.bindVertexArray(null);
  }

  public render(gl: WebGL2RenderingContext): void {
    gl.bindVertexArray(this.vao);
    gl.drawElements(GL_TRIANGLES, this.indices.length, GL_UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null);
  }
}
