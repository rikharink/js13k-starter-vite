import { Vector2 } from '../math/vector2';
import { Sprite } from '../rendering/sprite';
import { UIElement } from './ui-element';

export class ProgressBar implements UIElement {
  position: Vector2 = [0, 0];
  size: Vector2 = [0, 0];
  sprites: Sprite[] = [];

  tick(): void {}
}
