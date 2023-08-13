import { Vector2 } from '../vector2';

export interface AABB {
  min: Vector2;
  max: Vector2;
}

export function intersects(a: AABB, b: AABB): boolean {
  return a.max[0] > b.min[0] && a.min[0] < b.max[0] && a.max[1] > a.min[1] && a.min[1] < b.max[1];
}

export function merge(a: AABB, b: AABB): AABB {
  return {
    min: [Math.min(a.min[0], b.min[0]), Math.min(a.min[1], b.min[1])],
    max: [Math.max(a.max[0], b.max[0]), Math.max(a.max[1], b.max[1])],
  };
}
