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


// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const app = document.getElementById('app')!;
app.innerHTML = `
<canvas id=g width=${Settings.resolution[0]} height=${Settings.resolution[1]}></canvas>
`;
const canvas = document.getElementById('g') as HTMLCanvasElement;
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const ctx = canvas.getContext('webgl2')!;

const keyboardManager = new KeyboardManager();
const gamepadManager = new GamepadManager();
const pointerManager = new PointerManager(canvas);

const sceneManager = new SceneManager();
sceneManager.pushScene(new BaseScene('#1F1F1F'));

if (import.meta.env.DEV) {
  const lil = await import('lil-gui');
  const gui = new lil.GUI();
  gui.add(Settings, 'fixedDeltaTime');
  gui.add(sceneManager.currentScene!, 'clearColor');
}


let audioSystem: AudioSystem | undefined = undefined;
document.addEventListener(
  'pointerdown',
  () => {
    console.log('init audio');
    audioSystem = new AudioSystem();
  },
  { once: true }
);

const renderer = new Renderer(ctx);
const rng = getRandom('I LOVE TINY GAMES');
const luckyNumber = rng();
console.debug('Your lucky number is: ', luckyNumber);
let _raf = 0;
let _then = 0;
let _accumulator = 0;
let _previousState: State | undefined = undefined;
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
  if (sceneManager.currentScene) {
    sceneManager.currentScene.pointer = pointerManager.getPointerLocation();
  }
  const alpha = _accumulator / Settings.fixedDeltaTime;
  const currentState = sceneManager.currentScene?.getState();
  if (currentState) {
    const renderState = _previousState ? currentState.blend(_previousState, alpha) : currentState;
    renderer.render(ctx, renderState, alpha);
  }

  keyboardManager.tick();
  gamepadManager.tick();
  pointerManager.tick();
  _then = now;
  _previousState = currentState;
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
