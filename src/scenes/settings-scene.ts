import { keyboardManager } from '../game';
import { ResourceManager } from '../managers/resource-manager';
import { SceneManager } from '../managers/scene-manager';
import { AABB } from '../math/geometry/aabb';
import { sat } from '../math/util';
import { Vector2 } from '../math/vector2';
import { Camera } from '../rendering/camera';
import { Sprite } from '../rendering/sprite';
import { Settings } from '../settings';
import { Background, Scene } from './scene';

export class SettingsScene implements Scene {
  public name = 'Settings';
  public bg: Background = { type: 'color', color: [1, 1, 1, 1] };
  public sprites: Sprite[] = [];
  public trauma: number = 1;
  public traumaDampening = 0.02;
  public bounds: AABB;
  public camera: Camera;
  public sceneTime: number = 0;

  constructor(
    public sceneManager: SceneManager,
    public resourceManager: ResourceManager,
  ) {
    this.camera = new Camera(Settings.resolution as Vector2);
    this.bounds = {
      min: [0, 0],
      max: [Settings.resolution[0], Settings.resolution[1]],
    };
  }

  onPush(): void {
    console.debug(`pushed scene: ${this.name}`);
    this.sceneTime = 0;
  }

  onPop(): void {
    console.debug(`Scene ${this.name} ran for ${this.sceneTime}ms`);
  }

  fixedTick(): void {   
    this.sceneTime += Settings.fixedDeltaTime * Settings.timeScale;
  }

  variableTick(): void {
    if (keyboardManager.hasKeyUp('Escape')) {
      this.sceneManager.popScene();
    }
    
    this.trauma -= this.traumaDampening;
    this.trauma = sat(this.trauma);
  }
}
