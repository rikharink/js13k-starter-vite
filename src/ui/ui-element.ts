import { Vector2 } from '../math/vector2';
import { Sprite } from '../rendering/sprite';

export interface UIElement {
  position: Vector2;
  size: Vector2;
  sprites: Sprite[];
  tick(): void;
}
