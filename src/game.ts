import './style.css';
import { SceneManager } from './managers/scene-manager';
//import { getRandom } from "./math/random";
import { Renderer } from './renderer';
import { Settings } from './settings';
import { KeyboardManager } from './managers/keyboard-manager';
import { PointerManager } from './managers/pointer-manager';
import { TAU } from './math/const';
import { GamepadManager } from './managers/gamepad-manager';
import { AudioSystem } from './audio/audio-system';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const app = document.getElementById('app')!;
app.innerHTML = `
<canvas id=g width=${Settings.resolution[0]} height=${Settings.resolution[1]}></canvas>
`;
const canvas = document.getElementById('g') as HTMLCanvasElement;
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const ctx = canvas.getContext('2d')!;

const keyboardManager = new KeyboardManager();
const gamepadManager = new GamepadManager();
const pointerManager = new PointerManager(canvas);

const sceneManager = new SceneManager();
sceneManager.pushScene({ clearColor: 'black' });

let audioSystem: AudioSystem | undefined = undefined;
document.addEventListener(
  'pointerdown',
  () => {
    console.log('init audio');
    audioSystem = new AudioSystem();
  },
  { once: true }
);
const renderer = new Renderer();
//const rng = getRandom("I LOVE TINY GAMES");

let _raf = 0;
let _then = 0;
let _accumulator = 0;
//let _t = 0;

function gameloop(now: number): void {
  const dt = now - _then;
  if (dt > 1000) {
    _then = now;
    return;
  }

  _accumulator += dt;
  while (_accumulator >= Settings.fixedDeltaTime) {
    //FIXED STEP
    //_t += Settings.fixedDeltaTime;
    _accumulator -= Settings.fixedDeltaTime;
  }

  //VARIABLE STEP
  const alpha = _accumulator / Settings.fixedDeltaTime;
  if (sceneManager.currentScene) {
    renderer.render(ctx, sceneManager.currentScene, alpha);
  }

  //if (pointerManager.hasPointerDown()) {
  const [mx, my] = pointerManager.getPointerLocation();
  ctx.strokeStyle = 'hotpink';
  ctx.beginPath();
  ctx.arc(mx, my, 10, 0, TAU);
  ctx.stroke();
  //}

  _raf = requestAnimationFrame(gameloop);
  keyboardManager.tick();
  gamepadManager.tick();
  pointerManager.tick();
  _then = now;
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
