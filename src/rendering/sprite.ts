import { NormalizedRgbColor } from '../math/color';
import { Vector2, add, scale } from '../math/vector2';
import { Texture } from '../textures/texture';
import { Radian } from '../types';
import { Rectangle } from '../math/geometry/rectangle';
import { AABB } from '../math/geometry/aabb';
import { TAU } from '../math/const';

export class Sprite {
  id: number;
  sourceRect: Rectangle;
  texture: Texture;
  color: NormalizedRgbColor = [1, 1, 1];
  size: Vector2;
  position: Vector2;
  velocity: Vector2 = [0, 0];
  rotation: Radian = 0;
  anchor: Vector2 = [0.5, 0.5];
  flipx: boolean = false;
  flipy: boolean = false;
  fov: Radian = TAU;

  private _collider: AABB;

  constructor(id: number, size: Vector2, position: Vector2, texture: Texture) {
    this.id = id;
    this.texture = texture;
    this.sourceRect = texture.sourceRect;
    this.size = size;
    this.position = position;
    this._collider = {
      min: this.position,
      max: [this.position[0] + this.size[0], this.position[0] + this.size[1]],
    };
  }

  public contains(point: Vector2): boolean {
    const collider = this.collider;
    return (
      point[0] >= collider.min[0] &&
      point[0] <= collider.max[0] &&
      point[1] >= collider.min[1] &&
      point[1] <= collider.max[1]
    );
  }

  public get center(): Vector2 {
    return add([0, 0], this.position, scale(V, this.size, 0.5));
  }

  public get collider(): AABB {
    this._collider.max[0] = this.position[0] + this.size[0];
    this._collider.max[1] = this.position[1] + this.size[1];
    return this._collider;
  }
}

const V: Vector2 = [0, 0];
