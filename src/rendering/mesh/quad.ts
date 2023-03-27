import { Shader } from '../shader';
import { Mesh } from './mesh';

export class Quad extends Mesh {
  constructor(gl: WebGL2RenderingContext, material: Shader) {
    const vertices = new Float32Array([-1, 1, 0, -1, -1, 0, 1, -1, 0, 1, 1, 0]);
    const indices = new Uint16Array([3, 2, 1, 3, 1, 0]);
    super(gl, vertices, indices, material);
  }
}
