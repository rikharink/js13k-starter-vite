import { rng } from '../game';
import { ResourceManager } from '../managers/resource-manager';
import { getBoundRandomInt } from '../math/random';
import { clamp, range } from '../math/util';
import { Vector2, add, reflect, scale } from '../math/vector2';
import { Sprite } from '../rendering/sprite';
import { Texture } from '../textures/texture';
import { Scene } from './scene';
import { Camera } from '../rendering/camera';
import { ObjectPool } from '../data-structures/object-pool';
import { AABB } from '../math/geometry/aabb';
import { Settings } from '../settings';

const directions: Vector2[] = range(0, 3).map((i) => {
  let a = 0.7853982 + (i * Math.PI) / 2;
  return [Math.cos(a), Math.sin(a)];
});

export class BaseScene implements Scene {
  public name = 'base scene';
  public camera: Camera;
  public sprites: Sprite[];
  public trauma: number = 0;
  public traumaDampening: number = 0.007;
  public bounds: AABB = {
    min: [0, 0],
    max: [1280 * 1, 800 * 1],
  };
  private texture: Texture;
  private spriteId = 0;
  private spritePool;

  public constructor(resourceManager: ResourceManager, camera: Camera) {
    this.texture = resourceManager.textures.get('snake')!;
    this.sprites = [];
    this.camera = camera;
    this.spritePool = new ObjectPool<Sprite>(1000, this.newSprite.bind(this), this.resetSprite.bind(this));
    for (let i = 0; i < 10; i++) {
      this.sprites.push(this.spritePool.get());
    }
  }

  private resetSprite(s: Sprite): void {
    const direction = directions[getBoundRandomInt(rng, 0, 3)()];
    s.id = this.spriteId++;
    s.velocity[0] = direction[0] * 10;
    s.velocity[1] = direction[1] * 10;
    const size: Vector2 = [100, 100];
    s.drawRect = {
      position: [rng() * (this.bounds.max[0] - size[0]), rng() * (this.bounds.max[1] - size[1])],
      size,
    };
    s.sourceRect = this.texture.sourceRect;
    s.color = [1, 1, 1];
    s.flipx = false;
    s.flipy = false;
    s.rotation = 0;
    s.anchor = [0.5, 0.5];
  }

  private newSprite(): Sprite {
    const size: Vector2 = [100, 100];
    const direction = directions[getBoundRandomInt(rng, 0, 3)()];
    const velocity = scale([0, 0], direction, 10);
    return {
      id: this.spriteId++,
      sourceRect: this.texture.sourceRect,
      drawRect: {
        position: [rng() * (this.bounds.max[0] - size[0]), rng() * (this.bounds.max[1] - size[1])],
        size,
      },
      collider: {},
      color: [1, 1, 1],
      texture: this.texture,
      velocity,
      flipx: Math.sign(direction[0]) === 1,
      flipy: Math.sign(direction[1]) === 1,
      rotation: 0,
      anchor: [0.5, 0.5],
    };
  }

  public onPush(): void {
    console.debug(`pushed scene: ${this.name}`);
  }

  public onPop(): void {
    console.debug(`popped scene: ${this.name}`);
  }

  private bounce(sprite: Sprite, r: Vector2) {
    sprite.drawRect.position = [
      clamp(this.bounds.min[0], this.bounds.max[0] - sprite.drawRect.size[0], sprite.drawRect.position[0]),
      clamp(this.bounds.min[1], this.bounds.max[1] - sprite.drawRect.size[1], sprite.drawRect.position[1]),
    ];
    reflect(sprite.velocity!, sprite.velocity!, r);
  }

  public tick(camera: Camera): void {
    for (const sprite of this.sprites) {
      add(sprite.drawRect.position, sprite.drawRect.position, scale([0, 0], sprite.velocity, Settings.timeScale));
      let hitWall = 0;
      if (
        sprite.drawRect.position[0] <= this.bounds.min[0] ||
        sprite.drawRect.position[0] >= this.bounds.max[0] - sprite.drawRect.size[0]
      ) {
        this.bounce(sprite, [0, 1]);
        sprite.flipx = Math.sign(sprite.velocity![0]) === 1;
        hitWall++;
      }
      if (
        sprite.drawRect.position[1] <= this.bounds.min[1] ||
        sprite.drawRect.position[1] >= this.bounds.max[1] - sprite.drawRect.size[1]
      ) {
        this.bounce(sprite, [-1, 0]);
        sprite.flipy = Math.sign(sprite.velocity![1]) === 1;
        hitWall++;
      }

      if (hitWall === 2) {
        this.sprites.push(this.spritePool.get());
      }
      this.trauma -= this.traumaDampening;
      this.trauma = clamp(0, 1, this.trauma);
    }

    this.sprites[0].color = [1, 0, 0];
    if (Settings.followCam) {
      add(
        camera.wantedOrigin,
        this.sprites[0].drawRect.position,
        scale(camera.wantedOrigin, this.sprites[0].drawRect.size, 0.5),
      );
    }
  }
}
