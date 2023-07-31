import { initShaderProgram, loadTexture } from '../rendering/gl-util';
import { PostEffect } from '../rendering/post-effects/post-effect';
import { Shader } from '../rendering/shaders/shader';
import { LoaderScene } from '../scenes/loader-scene';
import { SceneManager } from './scene-manager';

export class ResourceManager {
  public shaders: Map<string, Shader> = new Map();
  public images: Map<string, WebGLTexture> = new Map();
  private postEffects: Map<string, [number, PostEffect]> = new Map();
  private postEffectIndex: number = 0;

  public addPostEffect(key: string, pfx: PostEffect): ResourceManager {
    this.postEffects.set(key, [this.postEffectIndex, pfx]);
    this.postEffectIndex += 1;
    return this;
  }

  public getPostEffect(key: string): PostEffect {
    return this.postEffects.get(key)![1];
  }

  public getAllPostEffects(): PostEffect[] {
    return Array.from(this.postEffects.values())
      .sort((a, b) => {
        if (a[0] > b[0]) return +1;
        if (a[0] < b[0]) return -1;
        return 0;
      })
      .map((a) => a[1]);
  }
}

type ShaderToLoad = [key: string, vert: string, frag: string];
type ImageToLoad = [key: string, uri: string];
type TextureToGenerate = [key: string, generator: TextureGenerator];
type TextureGenerator = () => WebGLTexture;

export class ResourceManagerBuilder {
  private mgr = new ResourceManager();
  private shadersToLoad: ShaderToLoad[] = [];
  private imagesToLoad: ImageToLoad[] = [];
  private texturesToGenerate: TextureToGenerate[] = [];

  public addShader(key: string, vert: string, frag: string): ResourceManagerBuilder {
    this.shadersToLoad.push([key, vert, frag]);
    return this;
  }

  public addImage(key: string, uri: string): ResourceManagerBuilder {
    this.imagesToLoad.push([key, uri]);
    return this;
  }

  public addProceduralTexture(key: string, generator: TextureGenerator): ResourceManagerBuilder {
    this.texturesToGenerate.push([key, generator]);
    return this;
  }

  public build(gl: WebGL2RenderingContext, sceneManager: SceneManager): ResourceManager {
    const loaderScene = new LoaderScene([0, 0, 0]);

    sceneManager.pushScene(loaderScene);
    const total = this.shadersToLoad.length + this.imagesToLoad.length + this.texturesToGenerate.length;
    let progress = 0;

    function incrementProgress() {
      progress += 1;
      const progressPercentage = (progress / total) * 100;
      loaderScene.progress = progressPercentage;
      console.info(`loading progress: ${progressPercentage}%`);
    }

    for (const [key, generator] of this.texturesToGenerate) {
      this.mgr.images.set(key, generator());
      incrementProgress();
    }

    for (const [key, uri] of this.imagesToLoad) {
      loadTexture(gl, uri).then((t) => {
        this.mgr.images.set(key, t);
        incrementProgress();
      });
    }

    for (const [key, vert, frag] of this.shadersToLoad) {
      this.mgr.shaders.set(key, initShaderProgram(gl, vert, frag)!);
      incrementProgress();
    }

    sceneManager.popScene();
    return this.mgr;
  }
}
