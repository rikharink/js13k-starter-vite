import frag from '../rendering/default.frag?raw';
import vert from '../rendering/default.vert?raw';
import { initShaderProgram } from '../rendering/gl-util';

export class ResourceManager {
  [key: string]: any;

  public async init(gl: WebGL2RenderingContext): Promise<void> {
    this['sprite'] = initShaderProgram(gl, vert, frag)!;
  }
}
