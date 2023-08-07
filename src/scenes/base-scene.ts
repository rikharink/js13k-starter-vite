import { rng } from '../game';
import { ResourceManager } from '../managers/resource-manager';
import { getBoundRandomInt } from '../math/random';
import { clamp, range } from '../math/util';
import { Vector2, add, reflect, scale } from '../math/vector2';
import { Sprite } from '../rendering/sprite';
import { Texture } from '../textures/texture';
import { Settings } from '../settings';
import { Scene } from './scene';
import { dir } from 'console';
import { TAU } from '../math/const';

export class BaseScene implements Scene {
  public name = 'base scene';
  public sprites: Sprite[];
  private texture: Texture;

  public constructor(resourceManager: ResourceManager) {
    this.texture = resourceManager.textures.get('snake')!;
    this.sprites = [];
    for (let i = 0; i < 10; i++) {
      this.addSprite();
    }
  }

  private addSprite() {
    const size: Vector2 = [100, 100];
    const directions: Vector2[] = range(0, 3).map((i) => {
      let a = 0.7853982 + (i * Math.PI) / 2;
      return [Math.cos(a), Math.sin(a)];
    });
    const direction = directions[getBoundRandomInt(rng, 0, 3)()];
    this.sprites.push({
      name: `${this.sprites.length}`,
      sourceRect: this.texture.sourceRect,
      drawRect: {
        position: [rng() * (Settings.resolution[0] - size[0]), rng() * (Settings.resolution[1] - size[1])],
        size,
      },
      color: [rng(), rng(), rng()],
      texture: this.texture,
      direction,
      flipx: Math.sign(direction[0]) === 1,
      flipy: Math.sign(direction[1]) === 1,
      rotation: 0,
      anchor: [0.5, 0.5],
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
      sprite.drawRect.position = [
        clamp(0, Settings.resolution[0] - sprite.drawRect.size[0], sprite.drawRect.position[0]),
        clamp(0, Settings.resolution[1] - sprite.drawRect.size[1], sprite.drawRect.position[1]),
      ];
      reflect(sprite.direction!, sprite.direction!, r);
    }

    for (const sprite of this.sprites) {
      const movement = scale([0, 0], sprite.direction!, 10);
      add(sprite.drawRect.position, sprite.drawRect.position, movement);
      let hitWall = 0;
      if (
        sprite.drawRect.position[0] <= 0 ||
        sprite.drawRect.position[0] >= Settings.resolution[0] - sprite.drawRect.size[0]
      ) {
        bounce(sprite, [0, 1]);
        sprite.flipx = Math.sign(sprite.direction![0]) === 1;
        hitWall++;
      }
      if (
        sprite.drawRect.position[1] <= 0 ||
        sprite.drawRect.position[1] >= Settings.resolution[1] - sprite.drawRect.size[1]
      ) {
        bounce(sprite, [-1, 0]);
        sprite.flipy = Math.sign(sprite.direction![1]) === 1;
        hitWall++;
      }

      if (hitWall === 2) {
        this.addSprite();
      }
    }
  }
}
