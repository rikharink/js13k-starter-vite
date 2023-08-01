import './style.css';
import spriteVert from './rendering/shaders/default.vert';
import spriteFrag from './rendering/shaders/default.frag';
import postVert from './rendering/shaders/post.vert';
import postFrag from './rendering/shaders/post.frag';
import crtFrag from './rendering/shaders/crt.frag';
import { SceneManager } from './managers/scene-manager';
import { getRandom } from './math/random';
import { Renderer } from './rendering/renderer';
import { Settings } from './settings';
import { KeyboardManager } from './managers/keyboard-manager';
import { PointerManager } from './managers/pointer-manager';
import { GamepadManager } from './managers/gamepad-manager';
import { AudioSystem } from './audio/audio-system';
import { BaseScene } from './scenes/base-scene';
import { ResourceManagerBuilder } from './managers/resource-manager';
import { ColorCorrection } from './rendering/post-effects/color-correction';
import { Passthrough } from './rendering/post-effects/passthrough';
import pine from './textures/pine.svg';
import noise from './textures/noise.svg';
import { Hud } from './hud';
import { Crt } from './rendering/post-effects/crt';
import GUI from 'lil-gui';

let s: any;
let lil;
let gui: GUI;

if (import.meta.env.DEV) {
  s = await import('stats.js');
  lil = await import('lil-gui');
  gui = new lil.GUI();
}

const app = document.getElementById('app')!;
app.innerHTML = `
<canvas id=g width=${Settings.resolution[0]} height=${Settings.resolution[1]}></canvas>
`;
export const canvas = document.getElementById('g') as HTMLCanvasElement;
export const hud = new Hud();
const gl = canvas.getContext('webgl2')!;

const keyboardManager = new KeyboardManager();
const gamepadManager = new GamepadManager();
const pointerManager = new PointerManager(canvas);
let isPaused = false;

export const rng = getRandom('JS13K2023');

const sceneManager = new SceneManager();
export let t = 0;

new ResourceManagerBuilder()
  .addShader('sprite', spriteVert, spriteFrag)
  .addShader('crt', postVert, crtFrag)
  .addShader('post', postVert, postFrag)
  .addSvgTexture('pine', pine)
  .addSvgTexture('noise', noise)
  .build(gl, sceneManager)
  .then((resourceManager) => {
    resourceManager
      .addPostEffect('crt', new Crt(gl, resourceManager))
      .addPostEffect('cc', new ColorCorrection(gl, resourceManager))
      .addPostEffect('pt', new Passthrough(gl, resourceManager, null));

    const renderer = new Renderer(gl, resourceManager);

    sceneManager.pushScene(
      new BaseScene(gl, [0.1019607843137254902, 0.37254901960784313725, 0.70588235294117647059], resourceManager),
    );

    let stats: Stats | undefined = s;
    if (import.meta.env.DEV) {
      gui.add(Settings, 'fixedDeltaTime');
      gui.addColor(sceneManager.currentScene, 'clearColor');
      gui.add(resourceManager.getPostEffect('cc'), 'isEnabled').name('color correction enabled');
      gui.add(resourceManager.getPostEffect('cc'), 'contrast', -1, 1, 0.05);
      gui.add(resourceManager.getPostEffect('cc'), 'brightness', -1, 1, 0.05);
      gui.add(resourceManager.getPostEffect('cc'), 'exposure', -1, 1, 0.05);
      gui.add(resourceManager.getPostEffect('cc'), 'saturation', -1, 1, 0.05);
      gui.addColor(resourceManager.getPostEffect('cc'), 'colorFilter');
      gui.add(resourceManager.getPostEffect('crt'), 'isEnabled').name('crt enabled');
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
      requestAnimationFrame(gameloop);
      if (isPaused) return;

      stats?.begin();
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
      if (sceneManager.currentScene) {
        sceneManager.currentScene.pointer = pointerManager.getPointerLocation();
      }
      const alpha = _accumulator / Settings.fixedDeltaTime;
      hud.render(now);
      renderer.render(gl, sceneManager.currentScene, alpha, now);
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
  });
