import { Vector2 } from '../math/vector2';
import { Texture } from './texture';

export interface TextureAtlas {
  atlas: Atlas;
  texture: Texture;
}

export interface Atlas {
  textures: AtlasTexture[];
}

export interface AtlasTexture {
  name: string;
  position: Vector2;
  size: Vector2;
}
