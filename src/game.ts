import './style.css';
import { SceneManager } from './managers/scene-manager';
import { getRandom } from './math/random';
import { Renderer } from './rendering/renderer';
import { Settings } from './settings';
import { KeyboardManager } from './managers/keyboard-manager';
import { PointerManager } from './managers/pointer-manager';
import { GamepadManager } from './managers/gamepad-manager';
import { AudioSystem } from './audio/audio-system';
import { BaseScene } from './scene';
import { State } from './state';
import Stats from 'stats.js';
import { ResourceManager } from './managers/resource-manager';

const app = document.getElementById('app')!;
app.innerHTML = `
<canvas id=g width=${Settings.resolution[0]} height=${Settings.resolution[1]}></canvas>
`;
const canvas = document.getElementById('g') as HTMLCanvasElement;
const gl = canvas.getContext('webgl2')!;

const keyboardManager = new KeyboardManager();
const gamepadManager = new GamepadManager();
const pointerManager = new PointerManager(canvas);

export const resourceManager = new ResourceManager();
await resourceManager.init(gl);

export const rng = getRandom(`${Math.random()}`);

const scene = new BaseScene([rng(), rng(), rng()]);
const sceneManager = new SceneManager();
sceneManager.pushScene(scene);

let stats: Stats | undefined = undefined;

if (import.meta.env.DEV) {
  const lil = await import('lil-gui');
  const gui = new lil.GUI();
  gui.add(Settings, 'fixedDeltaTime');
  gui.addColor(sceneManager.currentScene, 'clearColor');

  stats = new Stats();
  stats.showPanel(0);
  document.body.appendChild(stats.dom);
}

let audioSystem: AudioSystem | undefined = undefined;
document.addEventListener(
  'pointerdown',
  () => {
    audioSystem = new AudioSystem();
  },
  { once: true }
);

const renderer = new Renderer(gl);
let _raf = 0;
let _then = 0;
let _accumulator = 0;
let _previousState: State | undefined = undefined;

function gameloop(now: number): void {
  stats?.begin();
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
  const currentState = sceneManager.currentScene?.getState();
  if (currentState) {
    const renderState = _previousState ? currentState.blend(_previousState, alpha) : currentState;
    renderer.render(gl, renderState, alpha);
  }

  keyboardManager.tick();
  gamepadManager.tick();
  pointerManager.tick();
  _then = now;
  _previousState = currentState;
  stats?.end();
  _raf = requestAnimationFrame(gameloop);
}

async function pause(): Promise<void> {
  if (_raf === 0) {
    return;
  }
  if (audioSystem) {
    await audioSystem?.mute();
  }
  cancelAnimationFrame(_raf);
  _raf = 0;
}

async function resume(): Promise<void> {
  if (_raf !== 0) {
    return;
  }
  if (audioSystem) {
    await audioSystem.unmute();
  }
  _raf = requestAnimationFrame(gameloop);
}

requestAnimationFrame(gameloop);

document.addEventListener('visibilitychange', async () => {
  if (document.hidden) {
    await pause();
  } else {
    await resume();
  }
});
