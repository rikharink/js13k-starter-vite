import { Rectangle } from '../../rendering/sprite';
import { Vector2, add } from '../vector2';

export function pointInRectangle(point: Vector2, rectangle: Rectangle): boolean {
  const [px, py] = point;
  const [rx, ry] = rectangle.position;
  const [rw, rh] = rectangle.size;
  return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
}

const temp: Vector2 = [0, 0];
export function intersects(a: Rectangle, b: Rectangle): boolean {
  const tla = a.position;
  const bra = add(temp, tla, a.size);
  const tlb = b.position;
  const brb = add(temp, tlb, a.size);
  return tla[0] < brb[0] || bra[0] > tlb[0] || tla[1] < brb[1] || bra[1] > tlb[1];
}
