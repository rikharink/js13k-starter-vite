import './style.css';
import spriteVert from './rendering/shaders/sprite.vert';
import spriteFrag from './rendering/shaders/sprite.frag';
import postVert from './rendering/shaders/post.vert';
import postFrag from './rendering/shaders/post.frag';
import { SceneManager } from './managers/scene-manager';
import { getRandom } from './math/random';
import { MainRenderer } from './rendering/main-renderer';
import { Settings } from './settings';
import { KeyboardManager } from './managers/keyboard-manager';
import { PointerManager } from './managers/pointer-manager';
import { GamepadManager } from './managers/gamepad-manager';
import { AudioSystem } from './audio/audio-system';
import { ResourceManager, ResourceManagerBuilder } from './managers/resource-manager';
import { ColorCorrection } from './rendering/post-effects/color-correction';
import { Passthrough } from './rendering/post-effects/passthrough';
import GUI from 'lil-gui';
import { TAU } from './math/const';
import { MainMenuScene } from './scenes/main-menu-scene';

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
export const gl = canvas.getContext('webgl2', {
  alpha: false,
})!;

export const keyboardManager = new KeyboardManager();
export const gamepadManager = new GamepadManager();
export const pointerManager = new PointerManager(canvas);

let isPaused = false;

export const rng = getRandom('JS13K2023');

const sceneManager = new SceneManager();
export let gameTime = 0;

export let resourceManager: ResourceManager;

new ResourceManagerBuilder()
  .addShader('sprite', spriteVert, spriteFrag)
  .addShader('post', postVert, postFrag)
  .addTTTTexture('snake', [32,32,65295,3,-6,27,65535,0,32,"🐍"], gl)
  .build(gl, sceneManager)
  .then((rm) => {
    resourceManager = rm;
    rm
      .addPostEffect('cc', new ColorCorrection(gl, resourceManager))
      .addPostEffect('pt', new Passthrough(gl, resourceManager, null));

    const renderer = new MainRenderer(gl, resourceManager);

    sceneManager.pushScene(new MainMenuScene(sceneManager, resourceManager));
    let stats: Stats | undefined = undefined;
    if (import.meta.env.DEV) {
      const settings = gui.addFolder('settings');
      settings.add(Settings, 'fixedDeltaTime');
      settings.add(Settings, 'timeScale', 0, 1);

      const pfx = gui.addFolder('postEffects');
      pfx.add(resourceManager.getPostEffect('cc'), 'isEnabled').name('cc enabled');
      pfx.add(resourceManager.getPostEffect('cc'), 'contrast', -1, 1, 0.05);
      pfx.add(resourceManager.getPostEffect('cc'), 'brightness', -1, 1, 0.05);
      pfx.add(resourceManager.getPostEffect('cc'), 'exposure', -1, 1, 0.05);
      pfx.add(resourceManager.getPostEffect('cc'), 'saturation', -1, 1, 0.05);
      pfx.addColor(resourceManager.getPostEffect('cc'), 'colorFilter');

      const scene = gui.addFolder('scene');
      scene.add(sceneManager.currentScene, 'trauma', 0, 1, 0.01);
      scene.add(sceneManager.currentScene, 'traumaDampening', 0, 1, 0.00001);

      const cameraGui = gui.addFolder('camera');
      cameraGui.add(sceneManager.currentScene.camera, 'scale', 0.01, 10, 0.01).name('zoom');
      cameraGui.add(sceneManager.currentScene.camera, 'rotation', 0, TAU);
      cameraGui.add(Settings, 'maxRotationalShake', 0, TAU, 0.001);
      cameraGui.add(Settings, 'maxTranslationalShake', 0, 1000, 1);

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
      resizeCanvas();
      requestAnimationFrame(gameloop);
      if (isPaused) return;

      gameTime = now;
      const dt = now - _then;
      if (dt > 1000) {
        _then = now;
        return;
      }

      _accumulator += dt;
      while (_accumulator >= Settings.fixedDeltaTime) {
        //FIXED STEP
        sceneManager.currentScene.fixedTick();
        sceneManager.currentScene.camera.tick(
          gameTime,
          sceneManager.currentScene.trauma * sceneManager.currentScene.trauma,
        );
        gameTime += Settings.fixedDeltaTime;
        _accumulator -= Settings.fixedDeltaTime;
      }
      //VARIABLE STEP

      renderer.begin(gl);
      renderer.render(gl, sceneManager.currentScene, _accumulator / Settings.fixedDeltaTime, now);
      renderer.end(gl);

      sceneManager.currentScene.variableTick();
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

  function resizeCanvas() {
    const internalWidth = Settings.resolution[0];
    const internalHeight = Settings.resolution[1];
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const scaleFactor = Math.min(windowWidth / internalWidth, windowHeight / internalHeight);
    const scaledWidth = internalWidth * scaleFactor;
    const scaledHeight = internalHeight * scaleFactor;
    // Scale the canvas display size using CSS
    const sw = scaledWidth + 'px';
    const sh = scaledHeight + 'px';
    if (canvas.style.width !== sw || canvas.style.height !== sh) {
      canvas.style.width = sw;
      canvas.style.height = sh;
    }
  }