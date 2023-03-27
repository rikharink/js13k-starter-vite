import {
  GL_ARRAY_BUFFER,
  GL_ELEMENT_ARRAY_BUFFER,
  GL_STATIC_DRAW,
  GL_TRIANGLES,
  GL_UNSIGNED_SHORT,
} from '../gl-constants';
import { Renderable } from '../renderable';
import { Shader } from '../shader';

export abstract class Mesh implements Renderable {
  protected vao: WebGLVertexArrayObject;
  protected vertices: Float32Array;
  protected indices: Uint16Array;
  vertexBuffer: WebGLBuffer;
  indexBuffer: WebGLBuffer;

  protected constructor(gl: WebGL2RenderingContext, vertices: Float32Array, indices: Uint16Array, material: Shader) {
    this.vao = gl.createVertexArray()!;
    gl.bindVertexArray(this.vao);
    this.vertices = vertices;
    this.indices = indices;
    this.vertexBuffer = gl.createBuffer()!;
    this.indexBuffer = gl.createBuffer()!;
    gl.bindBuffer(GL_ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(GL_ARRAY_BUFFER, this.vertices, GL_STATIC_DRAW);
    gl.bindBuffer(GL_ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(GL_ELEMENT_ARRAY_BUFFER, this.indices, GL_STATIC_DRAW);
    const coord = material['pos'];
    gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coord);
    gl.bindVertexArray(null);
  }

  public render(gl: WebGL2RenderingContext): void {
    gl.bindVertexArray(this.vao);
    gl.drawElements(GL_TRIANGLES, this.indices.length, GL_UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null);
  }
}
