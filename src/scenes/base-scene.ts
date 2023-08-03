import { rng } from '../game';
import { ResourceManager } from '../managers/resource-manager';
import { clamp } from '../math/util';
import { Vector2, add, randomPointOnUnitCircle, reflect, scale } from '../math/vector2';
import { Sprite } from '../rendering/sprite';
import { Settings } from '../settings';
import { Scene } from './scene';

export class BaseScene implements Scene {
  public name = 'base scene';
  public sprites: Sprite[];
  private spriteAtlas: WebGLTexture;

  public constructor(resourceManager: ResourceManager) {
    this.spriteAtlas = resourceManager.textures.get('atlas')!;
    this.sprites = [];
    for (let i = 0; i < 10_000; i++) {
      this.addSprite();
    }
  }

  private addSprite() {
    const size: Vector2 = [100, 100];
    this.sprites.push({
      name: `${this.sprites.length}`,
      position: [rng() * Settings.resolution[0] - size[0], rng() * Settings.resolution[1] - size[1]],
      size,
      color: [rng(), rng(), rng()],
      texture: this.spriteAtlas,
      direction: randomPointOnUnitCircle([0, 0], rng),
    });
  }

  public onPush(): void {
    console.debug(`pushed scene: ${this.name}`);
  }

  public onPop(): void {
    console.debug(`popped scene: ${this.name}`);
  }

  public tick(): void {
    function bounce(sprite: Sprite, r: Vector2) {
      sprite.color = [rng(), rng(), rng()];
      sprite.position = [
        clamp(0, Settings.resolution[0] - sprite.size[0], sprite.position[0]),
        clamp(0, Settings.resolution[1] - sprite.size[1], sprite.position[1]),
      ];
      reflect(sprite.direction!, sprite.direction!, r);
    }
    for (const sprite of this.sprites) {
      const movement = scale([0, 0], sprite.direction!, 10);
      add(sprite.position, sprite.position, movement);
      if (sprite.position[0] <= 0 || sprite.position[0] >= Settings.resolution[0] - sprite.size[0]) {
        bounce(sprite, [0, 1]);
      } else if (sprite.position[1] <= 0 || sprite.position[1] >= Settings.resolution[1] - sprite.size[1]) {
        bounce(sprite, [-1, 0]);
      }
    }
  }
}
