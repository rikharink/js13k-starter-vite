import { EPSILON } from './const';

export function range(start: number, end: number): number[] {
  return Array.from('x'.repeat(end - start), (_, i) => start + i);
}

export function lerp(v0: number, v1: number, t: number): number {
  return v0 + t * (v1 - v0);
}

export function clamp(min: number, max: number, n: number): number {
  return Math.max(min, Math.min(max, n));
}

export function sat(n: number): number {
  return clamp(0, 1, n);
}

export function normalize(value: number, min: number, max: number): number {
  return (value - min) / (max - min);
}

export function nearlyEqual(a: number, b: number, epsilon?: number): boolean {
  const minNormal = Math.pow(2, -1022);
  epsilon = epsilon ?? EPSILON;
  if (a === b) {
    return true;
  }
  const diff = Math.abs(a - b);
  if (a === 0 || b === 0 || diff < minNormal) {
    return diff < epsilon * minNormal;
  } else {
    return diff / (Math.abs(a) + Math.abs(b)) < epsilon;
  }
}
