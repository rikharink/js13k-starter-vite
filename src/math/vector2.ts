import { Radian } from '../types';
import { TAU } from './const';
import { Random } from './random';
import { nearlyEqual as ne } from './util';

export type Vector2 = [x: number, y: number];

export function nearlyEqual(a: Vector2, b: Vector2, epsilon?: number): boolean {
  return !!(ne(a[0], b[0], epsilon) && ne(a[1], b[1], epsilon));
}

export function copy(out: Vector2, a: Vector2): Vector2 {
  out[0] = a[0];
  out[1] = a[1];
  return out;
}

export function add(out: Vector2, a: Vector2, b: Vector2): Vector2 {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  return out;
}

export function subtract(out: Vector2, a: Vector2, b: Vector2): Vector2 {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  return out;
}

export function scale(out: Vector2, a: Vector2, b: number): Vector2 {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  return out;
}

export function mul(out: Vector2, a: Vector2, b: Vector2): Vector2 {
  out[0] = a[0] * b[0];
  out[1] = a[1] * b[1];
  return out;
}

export function negate(out: Vector2, a: Vector2): Vector2 {
  out[0] = -a[0];
  out[1] = -a[1];
  return out;
}

export function normalize(out: Vector2, a: Vector2): Vector2 {
  const x = a[0];
  const y = a[1];
  let len = x * x + y * y;
  if (len > 0) {
    len = 1 / Math.sqrt(len);
  }
  out[0] = a[0] * len;
  out[1] = a[1] * len;
  return out;
}

export function dot(a: Vector2, b: Vector2): number {
  return a[0] * b[0] + a[1] * b[1];
}

export function distance(a: Vector2, b: Vector2): number {
  return Math.hypot(b[0] - a[0], b[1] - a[1]);
}

export function distance_squared(a: Vector2, b: Vector2): number {
  const x = b[0] - a[0];
  const y = b[1] - a[1];
  return x * x + y * y;
}

export function distance_manhattan(a: Vector2, b: Vector2): number {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}

export function abs(out: Vector2, a: Vector2): Vector2 {
  out[0] = Math.abs(a[0]);
  out[1] = Math.abs(a[1]);
  return out;
}

export function length(a: Vector2): number {
  const x = a[0];
  const y = a[1];
  return Math.hypot(x * x, y * y);
}

export function lerp(out: Vector2, a: Vector2, b: Vector2, t: number): Vector2 {
  const ax = a[0];
  const ay = a[1];
  out[0] = ax + t * (b[0] - ax);
  out[1] = ay + t * (b[1] - ay);
  return out;
}

const _a: Vector2 = [0, 0];
const _b: Vector2 = [0, 0];
const _c: Vector2 = [0, 0];
const _d: Vector2 = [0, 0];
const _e: Vector2 = [0, 0];
export function bezier(out: Vector2, p0: Vector2, p1: Vector2, p2: Vector2, p3: Vector2, t: number): Vector2 {
  lerp(_a, p0, p1, t);
  lerp(_b, p1, p2, t);
  lerp(_c, p2, p3, t);
  lerp(_d, _a, _b, t);
  lerp(_e, _b, _c, t);
  lerp(out, _d, _e, t);
  return out;
}

export function perpendicular(out: Vector2, dxdy: Vector2, clockwise = true): Vector2 {
  out[0] = dxdy[1];
  out[1] = dxdy[0];
  clockwise ? (out[1] = -out[1]) : (out[0] = -out[0]);
  return normalize(out, out);
}

export function reflect(out: Vector2, d: Vector2, r: Vector2): Vector2 {
  const k = dot(d, r) / dot(r, r);
  const twokn = scale([0, 0], r, 2 * k);
  out[0] = d[0];
  out[1] = d[1];
  scale(out, out, -1);
  add(out, out, twokn);
  return out;
}

export function randomPointOnUnitCircle(out: Vector2, rng: Random): Vector2 {
  const angle = TAU * rng();
  out[0] = Math.cos(angle);
  out[1] = Math.sin(angle);
  return out;
}

export function signedAngle(a: Vector2, b: Vector2): Radian {
  return Math.atan2(b[1], b[0]) - Math.atan2(a[1], a[0]);
}

export function angle(a: Vector2, b: Vector2): Radian {
  return Math.acos(dot(a, b) / (length(a) * length(b)));
}

export function rotate(o: Vector2, a: Vector2, b: Vector2, r: Radian): Vector2 {
  //Translate point to the origin
  let p0 = a[0] - b[0],
    p1 = a[1] - b[1],
    sinC = Math.sin(r),
    cosC = Math.cos(r);

  //perform rotation and translate to correct position
  o[0] = p0 * cosC - p1 * sinC + b[0];
  o[1] = p0 * sinC + p1 * cosC + b[1];

  return o;
}

export function limit(vector: Vector2, max: number): Vector2 {
  const l = length(vector);
  if (l > max) {
    vector[0] = (vector[0] / l) * max;
    vector[1] = (vector[1] / l) * max;
  }
  return vector;
}
