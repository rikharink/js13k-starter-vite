import { ResourceManager } from '../managers/resource-manager';
import { SceneManager } from '../managers/scene-manager';
import { AABB } from '../math/geometry/aabb';
import { sat } from '../math/util';
import { Vector2 } from '../math/vector2';
import { DARK_JADE } from '../palette';
import { Camera } from '../rendering/camera';
import { Sprite } from '../rendering/sprite';
import { Settings } from '../settings';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { StackLayout } from '../ui/stack-layout';
import { UIElement } from '../ui/ui-element';
import { BaseScene } from './base-scene';
import { Scene } from './scene';
import { SettingsScene } from './settings-scene';

const fontFamily = 'Superclarendon, "Bookman Old Style", "URW Bookman", "URW Bookman L", "Georgia Pro", Georgia, serif';

export class MainMenuScene implements Scene {
  public name: string = 'main menu';
  public sprites: Sprite[] = [];
  public bounds: AABB = {
    min: [0, 0],
    max: [Settings.resolution[0], Settings.resolution[1]],
  };
  public trauma: number = 0;
  public traumaDampening = 0.02;
  public camera: Camera;
  public sceneTime: number = 0;

  public sceneManager: SceneManager;
  public resourceManager: ResourceManager;
  private ui: UIElement[] = [];

  constructor(sceneManager: SceneManager, resourceManger: ResourceManager) {
    this.camera = new Camera([Settings.resolution[0], Settings.resolution[1]]);
    this.sceneManager = sceneManager;
    this.resourceManager = resourceManger;

    const menu = new StackLayout(16);
    const buttonSize: Vector2 = [176, 50];

    const play = new Button('play', 32, [0, 0], buttonSize, (btn) =>
      this.shakeAndPush(btn, new BaseScene(sceneManager, resourceManger), 0.7, 200),
    );
    const settings = new Button('settings', 32, [0, 0], buttonSize, (btn) =>
      this.shakeAndPush(btn, new SettingsScene(sceneManager, resourceManger), 0.7, 200),
    );
    menu.add(new Label('js13k-starter-vite', 72, fontFamily, DARK_JADE, [0, 0]));
    menu.add(new Label('a JS13K "engine" by Rik Harink', 32, fontFamily, DARK_JADE, [0, 0]));
    menu.add(play);
    menu.add(settings);
    menu.center(this.camera);
    this.ui.push(menu);
    this.sprites.push(...menu.sprites);
  }

  private shakeAndPush(button: Button, scene: Scene, intensity: number, duration: number): void {
    this.trauma = intensity;
    setTimeout(() => this.sceneManager.pushScene(scene), duration);
    setTimeout(
      (() => {
        button.disabled = false;
        this.trauma = 0;
      }).bind(this),
      200,
    );
  }

  onPush(): void {
    console.debug(`pushed scene: ${this.name}`);
    this.sceneTime = 0;
  }

  onPop(): void {
    console.debug(`Scene ${this.name} ran for ${this.sceneTime}ms`);
  }

  tick(): void {
    for (let ele of this.ui) {
      ele.tick();
    }
    this.camera.tick(this.sceneTime, this.trauma * this.trauma);

    this.trauma -= this.traumaDampening;
    this.trauma = sat(this.trauma);
    this.sceneTime += Settings.fixedDeltaTime * Settings.timeScale;
  }
}
