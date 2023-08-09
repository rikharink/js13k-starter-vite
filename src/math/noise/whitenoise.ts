import { Random } from '../random';
import { Size } from '../../types';

export function get4ChannelNoise(size: Size, rng: Random) {
  const n = size[0] * size[1];
  const pixels: Float32Array = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) {
    const pi = i * 4;
    pixels[pi + 0] = rng();
    pixels[pi + 1] = rng();
    pixels[pi + 2] = rng();
    pixels[pi + 3] = rng();
  }
  return pixels;
}

export function getWhiteNoise(size: Size, rng: Random): Float32Array {
  const n = size[0] * size[1];
  const pixels: Float32Array = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) {
    const pi = i * 4;
    const v = rng();
    pixels[pi + 0] = v;
    pixels[pi + 1] = v;
    pixels[pi + 2] = v;
    pixels[pi + 3] = 1;
  }
  return pixels;
}
