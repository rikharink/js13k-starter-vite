import { NormalizedRgbColor } from '../math/color';
import { Vector2 } from '../math/vector2';
import { Texture } from '../textures/texture';

export interface Rectangle {
  position: Vector2;
  size: Vector2;
}

export interface Sprite {
  name: string;
  drawRect: Rectangle;
  sourceRect: Rectangle;
  color: NormalizedRgbColor;
  texture: Texture;
  direction: Vector2 | null;
}
