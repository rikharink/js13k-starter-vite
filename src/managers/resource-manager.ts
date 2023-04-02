import spriteVert from '../rendering/default.vert?raw';
import spriteFrag from '../rendering/default.frag?raw';
import { initShaderProgram } from '../rendering/gl-util';
import { Shader } from '../rendering/shader';
import { Milliseconds } from '../types';
import { delay } from '../util';
import { LoaderScene } from '../scene';
import { rng } from '../game';
import { Renderer } from '../rendering/renderer';

export class ResourceManager {
  [key: string]: Shader;
}

type ShaderToLoad = [key: string, vert: string, frag: string];

export class ResourceManagerBuilder {
  private mgr = new ResourceManager();
  private shadersToLoad: ShaderToLoad[] = [];
  private delays: Milliseconds[] = [];
  private renderer: Renderer;

  public constructor(gl: WebGL2RenderingContext, renderer: Renderer) {
    this.mgr['sprite'] = initShaderProgram(gl, spriteVert, spriteFrag)!;
    this.renderer = renderer;
  }

  public addShader(key: string, vert: string, frag: string): ResourceManagerBuilder {
    this.shadersToLoad.push([key, vert, frag]);
    return this;
  }

  public addDelay(time: Milliseconds): ResourceManagerBuilder {
    this.delays.push(time);
    return this;
  }

  public async build(gl: WebGL2RenderingContext): Promise<ResourceManager> {
    console.log('BUILDING RESOURCES');
    const scene = new LoaderScene([255 * rng(), 255 * rng(), 255 * rng()]);
    scene.init(gl, this.mgr);

    const total = this.shadersToLoad.length + this.delays.length;
    let progress = 0;

    for (const [key, vert, frag] of this.shadersToLoad) {
      this.mgr[key] = initShaderProgram(gl, vert, frag)!;
      progress += 1;
      scene.progress = progress / total;
      this.renderer.render(gl, this.mgr, scene, 0);
      gl.flush();
      console.log('progress: ', (progress / total) * 100, '%');
    }

    for (const dt of this.delays) {
      await delay(dt);
      progress += 1;
      scene.progress = progress / total;
      this.renderer.render(gl, this.mgr, scene, 0);
      gl.flush();
      console.log('progress: ', (progress / total) * 100, '%');
    }
    scene.progress = 1;
    this.renderer.render(gl, this.mgr, scene, 0);
    gl.flush();
    return this.mgr;
  }
}
