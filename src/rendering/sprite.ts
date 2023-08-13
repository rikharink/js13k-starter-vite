import { Collider } from '../game/collider';
import { NormalizedRgbColor } from '../math/color';
import { Vector2 } from '../math/vector2';
import { Texture } from '../textures/texture';
import { Radian } from '../types';
import { Rectangle } from '../math/geometry/rectangle';

export interface Sprite {
  id: number;
  drawRect: Rectangle;
  sourceRect: Rectangle;
  collider: Collider;
  color: NormalizedRgbColor;
  texture: Texture;
  velocity: Vector2;
  rotation: Radian;
  anchor: Vector2;
  flipx: boolean;
  flipy: boolean;
}
