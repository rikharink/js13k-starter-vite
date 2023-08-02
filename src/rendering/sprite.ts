import { RgbColor } from '../math/color';
import { Vector2 } from '../math/vector2';
import { Vector3 } from '../math/vector3';

export interface Sprite {
  name: string;
  position: Vector3;
  uv: Vector2;
  color: RgbColor;
  texture: WebGLTexture;
}
