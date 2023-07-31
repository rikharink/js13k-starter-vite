import { Shader } from '../shaders/shader';
import { Mesh } from './mesh';

export class Quad extends Mesh {
  constructor(gl: WebGL2RenderingContext, material: Shader) {
    const vertices = new Float32Array([
      -0.5, -0.5, 0.0, 0.0, 0.5, -0.5, 1.0, 0.0, 0.5, 0.5, 1.0, 1.0, -0.5, 0.5, 0.0, 1.0,
    ]);
    const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);
    super(gl, vertices, indices, material);
  }
}
