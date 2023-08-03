import { NormalizedRgbColor } from '../math/color';
import { Vector2 } from '../math/vector2';

export interface Sprite {
  name: string;
  position: Vector2;
  size: Vector2;
  color: NormalizedRgbColor;
  texture: WebGLTexture;
  direction: Vector2 | null;
}
