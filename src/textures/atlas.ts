import { Vector2 } from '../math/vector2';

export interface Atlas {
  textures: AtlasTexture[];
}

export interface AtlasTexture {
  name: string;
  position: Vector2;
  size: Vector2;
}
