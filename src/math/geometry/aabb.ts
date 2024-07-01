import { Vector2, add, scale, subtract } from '../vector2';
import { Rectangle } from './rectangle';

export interface AABB {
  min: Vector2;
  max: Vector2;
}

export function size(aabb: AABB): Vector2 {
  return subtract([0, 0], aabb.max, aabb.min);
}

export function center(aabb: AABB): Vector2 {
  const a = aabb.min;
  const b = scale([0, 0], aabb.max, 0.5);
  return add([0, 0], a, b);
}

export function toRectangle(aabb: AABB): Rectangle {
  return {
    position: aabb.min,
    size: size(aabb),
  };
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
