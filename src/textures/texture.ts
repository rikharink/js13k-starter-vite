import { Vector2 } from '../math/vector2';
import { Rectangle } from '../rendering/sprite';

export interface Texture {
  texture: WebGLTexture;
  size: Vector2;
  sourceRect: Rectangle;
}
