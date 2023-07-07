import { initShaderProgram } from '../rendering/gl-util';
import { Shader } from '../rendering/shader';
import { LoaderScene } from '../scenes/loader-scene';
import { SceneManager } from './scene-manager';

export class ResourceManager {
  [key: string]: Shader | HTMLImageElement;
}

type ShaderToLoad = [key: string, vert: string, frag: string];
type ImageToLoad = [key: string, uri: string];

export class ResourceManagerBuilder {
  private mgr = new ResourceManager();
  private shadersToLoad: ShaderToLoad[] = [];
  private imagesToLoad: ImageToLoad[] = [];

  public addShader(key: string, vert: string, frag: string): ResourceManagerBuilder {
    this.shadersToLoad.push([key, vert, frag]);
    return this;
  }

  public addImage(key: string, uri: string): ResourceManagerBuilder {
    this.imagesToLoad.push([key, uri]);
    return this;
  }

  public async build(gl: WebGL2RenderingContext, sceneManager: SceneManager): Promise<ResourceManager> {
    const loaderScene = new LoaderScene([0, 0, 0]);

    sceneManager.pushScene(loaderScene);
    const total = this.shadersToLoad.length + this.imagesToLoad.length;
    let progress = 0;

    for (const [key, uri] of this.imagesToLoad) {
      this.mgr[key] = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = uri;
      });
      progress = this.incrementProgress(progress, total, loaderScene);
    }

    for (const [key, vert, frag] of this.shadersToLoad) {
      this.mgr[key] = initShaderProgram(gl, vert, frag)!;
      progress = this.incrementProgress(progress, total, loaderScene);
    }

    sceneManager.popScene();
    return this.mgr;
  }

  private incrementProgress(progress: number, total: number, loaderScene: LoaderScene): number {
    progress += 1;
    const progressPercentage = (progress / total) * 100;
    loaderScene.progress = progressPercentage;
    console.info(`loading progress: ${progressPercentage}%`);
    return progress;
  }
}
