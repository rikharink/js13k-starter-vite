import { initShaderProgram } from '../rendering/gl-util';
import { Shader } from '../rendering/shader';
import { LoaderScene } from '../scenes/loader-scene';
import { SceneManager } from './scene-manager';

export class ResourceManager {
  [key: string]: Shader;
}

type ShaderToLoad = [key: string, vert: string, frag: string];

export class ResourceManagerBuilder {
  private mgr = new ResourceManager();
  private shadersToLoad: ShaderToLoad[] = [];

  public addShader(key: string, vert: string, frag: string): ResourceManagerBuilder {
    this.shadersToLoad.push([key, vert, frag]);
    return this;
  }

  public async build(gl: WebGL2RenderingContext, sceneManager: SceneManager): Promise<ResourceManager> {
    const loaderScene = new LoaderScene([0, 0, 0]);

    sceneManager.pushScene(loaderScene);
    console.log('BUILDING RESOURCES');
    const total = this.shadersToLoad.length;
    let progress = 0;

    for (const [key, vert, frag] of this.shadersToLoad) {
      this.mgr[key] = initShaderProgram(gl, vert, frag)!;
      progress += 1;
      const progressPercentage = (progress / total) * 100;
      loaderScene.progress = progressPercentage;
      console.log('progress: ', progressPercentage, '%');
    }

    sceneManager.popScene();

    return this.mgr;
  }
}
