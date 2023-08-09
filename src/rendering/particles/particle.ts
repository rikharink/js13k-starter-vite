import { Vector2 } from '../../math/vector2';
import { Milliseconds } from '../../types';

export interface Particle {
  position: Vector2;
  velocity: Vector2;
  age: Milliseconds;
  life: Milliseconds;
}
