import { rng } from '../game';
import { ResourceManager } from '../managers/resource-manager';
import { getBoundRandomInt } from '../math/random';
import { clamp, range } from '../math/util';
import { Vector2, add, reflect, scale } from '../math/vector2';
import { Sprite } from '../rendering/sprite';
import { Texture } from '../textures/texture';
import { Background, Scene } from './scene';
import { Camera } from '../rendering/camera';
import { ObjectPool } from '../data-structures/object-pool';
import { AABB } from '../math/geometry/aabb';
import { Settings } from '../settings';
import { SceneManager } from '../managers/scene-manager';
import { NormalizedRgbaColor } from '../math/color';

const directions: Vector2[] = range(0, 3).map((i) => {
  let a = 0.7853982 + (i * Math.PI) / 2;
  return [Math.cos(a), Math.sin(a)];
});

export class BaseScene implements Scene {
  public name = 'base scene';
  public bg: Background = { type: 'color', color: [1, 1, 1, 1] as NormalizedRgbaColor };
  public camera: Camera;
  public sprites: Sprite[];
  public trauma: number = 0;
  public traumaDampening: number = 0.007;
  public bounds: AABB = {
    min: [0, 0],
    max: [1280 * 1, 800 * 1],
  };
  public sceneTime: number = 0;

  public resourceManager: ResourceManager;
  public sceneManager: SceneManager;
  
  private texture: Texture;
  private spriteId = 0;
  private spritePool;



  public constructor(sceneManager: SceneManager, resourceManager: ResourceManager) {
    this.sceneManager = sceneManager;
    this.resourceManager = resourceManager;
    this.texture = resourceManager.textures.get('snake')!;
    this.sprites = [];
    this.camera = new Camera([Settings.resolution[0], Settings.resolution[1]]);
    this.camera.followSpeed = [0.3, 0.3];
    this.spritePool = new ObjectPool<Sprite>(1000, this.newSprite.bind(this), this.resetSprite.bind(this));
    for (let i = 0; i < 100; i++) {
      this.sprites.push(this.spritePool.get());
    }
  }

  private resetSprite(s: Sprite): void {
    const direction = directions[getBoundRandomInt(rng, 0, 3)()];
    s.id = this.spriteId++;
    s.velocity[0] = direction[0] * 10;
    s.velocity[1] = direction[1] * 10;
    const size: Vector2 = [100, 100];
    s.position = [rng() * (this.bounds.max[0] - size[0]), rng() * (this.bounds.max[1] - size[1])]
    s.size = size;
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
    const position: Vector2 = [rng() * (this.bounds.max[0] - size[0]), rng() * (this.bounds.max[1] - size[1])];
    let sprite = new Sprite(this.spriteId++, size, position, this.texture);
    sprite.flipx = Math.sign(direction[0]) === 1;
    sprite.flipy = Math.sign(direction[1]) === 1;
    sprite.velocity = velocity;
    return sprite;
  }
    

  public onPush(): void {
    console.debug(`pushed scene: ${this.name}`);
  }

  public onPop(): void {
    console.debug(`popped scene: ${this.name}`);
  }

  private bounce(sprite: Sprite, r: Vector2) {
    sprite.position = [
      clamp(this.bounds.min[0], this.bounds.max[0] - sprite.size[0], sprite.position[0]),
      clamp(this.bounds.min[1], this.bounds.max[1] - sprite.size[1], sprite.position[1]),
    ];
    reflect(sprite.velocity!, sprite.velocity!, r);
  }


  public variableTick(): void {

  }
  
  public fixedTick(): void {
    for (const sprite of this.sprites) {
      add(sprite.position, sprite.position, scale([0, 0], sprite.velocity, Settings.timeScale));
      let hitWall = 0;
      if (
        sprite.position[0] <= this.bounds.min[0] ||
        sprite.position[0] >= this.bounds.max[0] - sprite.size[0]
      ) {
        this.bounce(sprite, [0, 1]);
        sprite.flipx = Math.sign(sprite.velocity![0]) === 1;
        hitWall++;
      }
      if (
        sprite.position[1] <= this.bounds.min[1] ||
        sprite.position[1] >= this.bounds.max[1] - sprite.size[1]
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
        this.camera.wantedOrigin,
        this.sprites[0].position,
        scale(this.camera.wantedOrigin, this.sprites[0].size, 0.5),
      );
    }

    
  }
}
