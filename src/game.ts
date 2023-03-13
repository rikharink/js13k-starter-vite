import "./style.css";
import { SceneManager } from "./managers/scene-manager";
import { getRandom } from "./math/random";
import { Renderer } from "./renderer";
import { Settings } from "./settings";
import { KeyboardManager } from "./managers/keyboard-manager";
import { PointerManager } from "./managers/pointer-manager";
import { TAU } from "./math/const";
import { GamepadManager } from "./managers/gamepad-manager";

const app = document.getElementById("app")!;
app.innerHTML = `
<canvas id=g width=${Settings.resolution[0]} height=${Settings.resolution[1]}></canvas>
`;
const canvas = document.getElementById("g") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

const keyboardManager = new KeyboardManager();
const gamepadManager = new GamepadManager();
const pointerManager = new PointerManager(canvas);

const sceneManager = new SceneManager();
sceneManager.pushScene({ clearColor: "black" });
const renderer = new Renderer();
const rng = getRandom("I LOVE TINY GAMES");

let _raf = 0;
let _then = 0;
let _accumulator = 0;
let _t = 0;

function gameloop(now: number) {
  let dt = now - _then;
  if (dt > 1000) {
    _then = now;
    return;
  }

  _accumulator += dt;
  while (_accumulator >= Settings.fixedDeltaTime) {
    //FIXED STEP
    _t += Settings.fixedDeltaTime;
    _accumulator -= Settings.fixedDeltaTime;
  }

  //VARIABLE STEP
  const alpha = _accumulator / Settings.fixedDeltaTime;
  if (sceneManager.currentScene) {
    renderer.render(ctx, sceneManager.currentScene, alpha);
  }

  if (pointerManager.hasPointerDown()) {
    let [mx, my] = pointerManager.getPointerLocation();
    ctx.strokeStyle = "hotpink";
    ctx.beginPath();
    ctx.arc(mx, my, 10, 0, TAU);
    ctx.stroke();
  }

  _raf = requestAnimationFrame(gameloop);
  keyboardManager.tick();
  gamepadManager.tick();
  pointerManager.tick();
  _then = now;
}

function pause() {
  if (_raf === 0) {
    return;
  }
  cancelAnimationFrame(_raf);
  _raf = 0;
}

function resume() {
  if (_raf !== 0) {
    return;
  }
  _raf = requestAnimationFrame(gameloop);
}

requestAnimationFrame(gameloop);

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    pause();
  } else {
    resume();
  }
});
