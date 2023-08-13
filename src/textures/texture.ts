import { Rectangle } from '../math/geometry/rectangle';
import { Vector2 } from '../math/vector2';

export interface Texture {
  texture: WebGLTexture;
  size: Vector2;
  sourceRect: Rectangle;
}
