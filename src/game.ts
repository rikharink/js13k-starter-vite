import './style.css';
import spriteVert from './rendering/shaders/sprite.vert';
import spriteFrag from './rendering/shaders/sprite.frag';
import postVert from './rendering/shaders/post.vert';
import postFrag from './rendering/shaders/post.frag';
import vhsFrag from './rendering/shaders/vhs.frag';

import { SceneManager } from './managers/scene-manager';
import { getRandom } from './math/random';
import { MainRenderer } from './rendering/main-renderer';
import { Settings } from './settings';
import { KeyboardManager } from './managers/keyboard-manager';
import { PointerManager } from './managers/pointer-manager';
import { GamepadManager } from './managers/gamepad-manager';
import { AudioSystem } from './audio/audio-system';
import { BaseScene } from './scenes/base-scene';
import { ResourceManagerBuilder } from './managers/resource-manager';
import { ColorCorrection } from './rendering/post-effects/color-correction';
import { Passthrough } from './rendering/post-effects/passthrough';
import { Vhs } from './rendering/post-effects/vhs';
import { generateColorNoiseTexture } from './textures/textures';
import atlasTexture from './textures/atlas.png';
import _atlas from './textures/atlas.json';
import { Atlas } from './textures/atlas';
import GUI from 'lil-gui';
import noise from './textures/noise.svg';
const atlas = _atlas as Atlas;

let lil;
let gui: GUI;
let s: any;

if (import.meta.env.DEV) {
  lil = await import('lil-gui');
  gui = new lil.GUI();
  s = await import('stats.js');
}

const app = document.getElementById('app')!;
app.innerHTML = `
<canvas id=g width=${Settings.resolution[0]} height=${Settings.resolution[1]}></canvas>
`;
export const canvas = document.getElementById('g') as HTMLCanvasElement;
const gl = canvas.getContext('webgl2', {
  alpha: false,
})!;

const keyboardManager = new KeyboardManager();
const gamepadManager = new GamepadManager();
const pointerManager = new PointerManager(canvas);
let isPaused = false;

export const rng = getRandom('JS13K2023');

const sceneManager = new SceneManager();
export let t = 0;

new ResourceManagerBuilder()
  .addShader('sprite', spriteVert, spriteFrag)
  .addShader('vhs', postVert, vhsFrag)
  .addShader('post', postVert, postFrag)
  .addProceduralTexture('noise', () => generateColorNoiseTexture(gl, [2048, 2048], rng))
  .addTextureAtlas(atlasTexture, atlas, true)
  .addSvgTexture('snoise', noise, false, true)
  .build(gl, sceneManager)
  .then((resourceManager) => {
    resourceManager
      .addPostEffect('vhs', new Vhs(gl, resourceManager))
      .addPostEffect('cc', new ColorCorrection(gl, resourceManager))
      .addPostEffect('pt', new Passthrough(gl, resourceManager, null));

    const renderer = new MainRenderer(gl, resourceManager);

    sceneManager.pushScene(new BaseScene(resourceManager));
    let stats: Stats | undefined = undefined;
    if (import.meta.env.DEV) {
      gui.add(Settings, 'fixedDeltaTime');
      gui.addColor(Settings, 'clearColor');
      gui.add(resourceManager.getPostEffect('cc'), 'isEnabled').name('cc enabled');
      gui.add(resourceManager.getPostEffect('vhs'), 'isEnabled').name('vhs enabled');
      gui.add(resourceManager.getPostEffect('vhs'), 'bend', 0.00000001, 5, 0.0001);
      gui.add(resourceManager.getPostEffect('cc'), 'contrast', -1, 1, 0.05);
      gui.add(resourceManager.getPostEffect('cc'), 'brightness', -1, 1, 0.05);
      gui.add(resourceManager.getPostEffect('cc'), 'exposure', -1, 1, 0.05);
      gui.add(resourceManager.getPostEffect('cc'), 'saturation', -1, 1, 0.05);
      gui.addColor(resourceManager.getPostEffect('cc'), 'colorFilter');

      stats = new s.default();
      stats!.showPanel(0);
      document.body.appendChild(stats!.dom);
    }

    let audioSystem: AudioSystem | undefined = undefined;
    document.addEventListener(
      'pointerdown',
      () => {
        audioSystem = new AudioSystem();
      },
      { once: true },
    );

    let _then = 0;
    let _accumulator = 0;

    function gameloop(now: number): void {
      stats?.begin();
      requestAnimationFrame(gameloop);
      if (isPaused) return;

      t = now;
      const dt = now - _then;
      if (dt > 1000) {
        _then = now;
        return;
      }

      _accumulator += dt;
      while (_accumulator >= Settings.fixedDeltaTime) {
        //FIXED STEP
        sceneManager.currentScene.tick(gl);
        _accumulator -= Settings.fixedDeltaTime;
      }

      //VARIABLE STEP

      renderer.begin(gl);
      renderer.render(
        gl,
        sceneManager.currentScene,
        _accumulator / Settings.fixedDeltaTime,
        now,
        sceneManager.currentScene.sprites.length,
      );
      renderer.end(gl);

      keyboardManager.tick();
      gamepadManager.tick();
      pointerManager.tick();
      _then = now;
      stats?.end();
    }

    function pause(): void {
      if (audioSystem) {
        audioSystem?.mute();
      }
      isPaused = true;
    }

    function resume(): void {
      console.log('resume');
      if (audioSystem) {
        audioSystem.unmute();
      }
      isPaused = false;
    }

    requestAnimationFrame(gameloop);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        pause();
      } else {
        resume();
      }
    });
  })
  .catch((e) => console.error(e));
