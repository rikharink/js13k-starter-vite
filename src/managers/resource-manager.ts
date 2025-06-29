import { canvasToTexture, createTexture, initShaderProgram, loadTexture } from '../rendering/gl-util';
import { PostEffect } from '../rendering/post-effects/post-effect';
import { Shader } from '../rendering/shaders/shader';
import { LoaderScene } from '../scenes/loader-scene';
import { SceneManager } from './scene-manager';
import { rng } from '../game';
import { Texture } from '../textures/texture';
import { Atlas } from '../textures/atlas';
import { generateSolidTexture } from '../textures/textures';
import { TTTexture, ttt } from '../textures/ttt';
import { TTTileMap, TTTileMapExport } from '../rendering/tttile-map';

export class ResourceManager {
  public shaders: Map<string, Shader> = new Map();
  public textures: Map<string, Texture> = new Map();
  public tilemaps: Map<string, TTTileMap> = new Map();
  private postEffects: Map<string, [number, PostEffect]> = new Map();
  private postEffectIndex: number = 0;

  public addPostEffect(key: string, pfx: PostEffect): ResourceManager {
    this.postEffects.set(key, [this.postEffectIndex, pfx]);
    this.postEffectIndex += 1;
    return this;
  }

  public getPostEffect<T extends PostEffect>(key: string): T {
    return this.postEffects.get(key)![1] as T;
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
type ImageToLoad = [key: string, uri: string, scaleNearest: boolean, repeat: boolean];
type AtlasToLoad = [uri: string, atlas: Atlas, scaleNearest: boolean];
type TTTToLoad = [
  keys: string[],
  data: TTTexture[],
  gl: WebGL2RenderingContext,
  scaleNearest: boolean,
  repeat: boolean,
];

type TextureToGenerate = [key: string, generator: TextureGenerator];
type TextureGenerator = (gl: WebGL2RenderingContext) => Texture;

export class ResourceManagerBuilder {
  private mgr = new ResourceManager();
  private shadersToLoad: ShaderToLoad[] = [];
  private imagesToLoad: ImageToLoad[] = [];
  private atlasToLoad: AtlasToLoad[] = [];
  private texturesToGenerate: TextureToGenerate[] = [];
  private tttToLoad: TTTToLoad[] = [];
  private tttTileMapsToGenerate: [string, TTTileMapExport, TTTexture[]][] = [];

  public addShader(key: string, vert: string, frag: string): ResourceManagerBuilder {
    this.shadersToLoad.push([key, vert, frag]);
    return this;
  }

  public addTexture(key: string, uri: string, scaleNearest = false, repeat = false): ResourceManagerBuilder {
    this.imagesToLoad.push([key, uri, scaleNearest, repeat]);
    return this;
  }

  public addTTTTexture(
    key: string,
    tttexture: TTTexture,
    gl: WebGL2RenderingContext,
    scaleNearest = false,
    repeat = false,
  ): ResourceManagerBuilder {
    this.addTTTTextures([key], [tttexture], gl, scaleNearest, repeat);
    return this;
  }

  public addTTTTextures(
    keys: string[],
    tttextures: TTTexture[],
    gl: WebGL2RenderingContext,
    scaleNearest = false,
    repeat = false,
  ): ResourceManagerBuilder {
    console.assert(keys.length === tttextures.length, 'keys and tttextures must have the same length');
    this.tttToLoad.push([keys, tttextures, gl, scaleNearest, repeat]);
    return this;
  }

  public addTTTileMap(key: string, tilemap: TTTileMapExport, textures: TTTexture[]) {
    this.tttTileMapsToGenerate.push([key, tilemap, textures]);
  }

  public addTextureAtlas(uri: string, atlas: Atlas, scaleNearest = false): ResourceManagerBuilder {
    this.atlasToLoad.push([uri, atlas, scaleNearest]);
    return this;
  }

  public addProceduralTexture(key: string, generator: TextureGenerator): ResourceManagerBuilder {
    this.texturesToGenerate.push([key, generator]);
    return this;
  }

  public addSvgTexture(key: string, svgSource: string, scaleNearest = false, repeat = false): ResourceManagerBuilder {
    const svgSeed = Math.ceil(rng() * 9999999999);
    const svg64 = btoa(svgSource.replace('seed="1"', `seed="${svgSeed}"`));
    const start = 'data:image/svg+xml;base64,';
    const src = start + svg64;
    this.imagesToLoad.push([key, src, scaleNearest, repeat]);
    return this;
  }

  public build(gl: WebGL2RenderingContext, sceneManager: SceneManager): Promise<ResourceManager> {
    const loaderScene = new LoaderScene();
    this.addProceduralTexture('sc', () => generateSolidTexture(gl, [1, 1, 1])).addProceduralTexture('white', () =>
      generateSolidTexture(gl, [255, 255, 255]),
    );

    sceneManager.pushScene(loaderScene);
    const total =
      this.shadersToLoad.length +
      this.imagesToLoad.length +
      this.texturesToGenerate.length +
      this.atlasToLoad.length +
      this.tttToLoad.length +
      this.tttTileMapsToGenerate.length;
    let progress = 0;

    function incrementProgress() {
      progress += 1;
      const progressPercentage = (progress / total) * 100;
      loaderScene.progress = progressPercentage;
    }

    const promises: Promise<any>[] = [];

    for (const [uri, atlas, scaleNearest] of this.atlasToLoad) {
      promises.push(
        loadTexture(gl, uri, scaleNearest).then((texture) => {
          for (const t of atlas.textures) {
            const atlasTexture: Texture = { ...texture };
            atlasTexture.sourceRect = {
              position: t.position,
              size: t.size,
            };
            this.mgr.textures.set(t.name, atlasTexture);
          }
          incrementProgress();
        }),
      );
    }

    for (const [key, generator] of this.texturesToGenerate) {
      this.mgr.textures.set(key, generator(gl));
      incrementProgress();
    }

    // for (const [key, tilemap, textures] of this.tttTileMapsToGenerate) {
    //   const tttTextures = ttt(textures);

    //   incrementProgress();
    // }

    for (const [keys, tttextures, gl, scaleNearest, repeat] of this.tttToLoad) {
      const textures = ttt(tttextures).map((t: HTMLCanvasElement) =>
        canvasToTexture(gl, t, createTexture(gl, [t.width, t.height]), scaleNearest, repeat),
      );
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const texture = textures[i];
        this.mgr.textures.set(key, texture);
      }
      incrementProgress();
    }

    for (const [key, vert, frag] of this.shadersToLoad) {
      this.mgr.shaders.set(key, initShaderProgram(gl, vert, frag)!);
      incrementProgress();
    }

    for (const [key, uri, scaleNearest, repeat] of this.imagesToLoad) {
      promises.push(
        loadTexture(gl, uri, scaleNearest, repeat).then((texture) => {
          this.mgr.textures.set(key, texture);
          incrementProgress();
        }),
      );
    }

    return new Promise((resolve, reject) => {
      const res = Promise.all(promises);
      res
        .then(() => {
          sceneManager.popScene();
          resolve(this.mgr);
        })
        .catch((e) => reject(e));
    });
  }
}
