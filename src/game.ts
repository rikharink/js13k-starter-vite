import './style.css';
import spriteVert from './rendering/shaders/default.vert';
import spriteFrag from './rendering/shaders/default.frag';
import postVert from './rendering/shaders/post.vert';
import postFrag from './rendering/shaders/post.frag';
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

const app = document.getElementById('app')!;
app.innerHTML = `
<canvas id=g width=${Settings.resolution[0]} height=${Settings.resolution[1]}></canvas>
`;
export const canvas = document.getElementById('g') as HTMLCanvasElement;
const gl = canvas.getContext('webgl2')!;

const keyboardManager = new KeyboardManager();
const gamepadManager = new GamepadManager();
const pointerManager = new PointerManager(canvas);

export const rng = getRandom("JS13K2023");

const sceneManager = new SceneManager();
const resourceManager = new ResourceManagerBuilder()
  .addShader('sprite', spriteVert, spriteFrag)
  .addShader('post', postVert, postFrag)
  .addSvgTexture('pine', pine)
  .build(gl, sceneManager);

resourceManager
  .addPostEffect('cc', new ColorCorrection(gl, resourceManager))
  .addPostEffect('pt', new Passthrough(gl, resourceManager, null));

const renderer = new Renderer(gl, resourceManager);

sceneManager.pushScene(new BaseScene(gl, [rng(), rng(), rng()], resourceManager));

let stats: Stats | undefined = undefined;
if (import.meta.env.DEV) {
  const s = await import('stats.js');
  const lil = await import('lil-gui');
  const gui = new lil.GUI();
  gui.add(Settings, 'fixedDeltaTime');
  gui.addColor(sceneManager.currentScene, 'clearColor');
  gui.add(resourceManager.getPostEffect('cc'), 'isEnabled').name('color correction enabled');
  gui.add(resourceManager.getPostEffect('cc'), 'contrast', -1, 1, 0.05);
  gui.add(resourceManager.getPostEffect('cc'), 'brightness', -1, 1, 0.05);
  gui.add(resourceManager.getPostEffect('cc'), 'exposure', -1, 1, 0.05);
  gui.add(resourceManager.getPostEffect('cc'), 'saturation', -1, 1, 0.05);
  stats = new s.default();
  stats.showPanel(0);
  document.body.appendChild(stats.dom);
}

let audioSystem: AudioSystem | undefined = undefined;
document.addEventListener(
  'pointerdown',
  () => {
    audioSystem = new AudioSystem();
  },
  { once: true },
);

let _raf = 0;
let _then = 0;
let _accumulator = 0;

export let t = 0;

function gameloop(now: number): void {
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
  renderer.render(gl, sceneManager.currentScene, alpha);

  keyboardManager.tick();
  gamepadManager.tick();
  pointerManager.tick();
  _then = now;
  stats?.end();
  _raf = requestAnimationFrame(gameloop);
}

function pause(): void {
  if (_raf === 0) {
    return;
  }
  if (audioSystem) {
    audioSystem?.mute();
  }
  cancelAnimationFrame(_raf);
  _raf = 0;
}

function resume(): void {
  if (_raf !== 0) {
    return;
  }
  if (audioSystem) {
    audioSystem.unmute();
  }
  _raf = requestAnimationFrame(gameloop);
}

requestAnimationFrame(gameloop);

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    pause();
  } else {
    resume();
  }
});
