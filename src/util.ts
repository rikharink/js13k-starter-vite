import { Milliseconds } from './types';

export function delay(ms: Milliseconds): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}
