import { Seconds } from '../../types';
import { getPinkNoiseSample } from '../util';

let _duration: Seconds;
let _buffer: AudioBuffer;

export function createReverb(ctx: AudioContext, duration: Seconds): ConvolverNode {
  if (duration != _duration) {
    _duration = duration;
    _buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    _buffer.copyToChannel(getIRSample(duration, ctx.sampleRate), 0);
  }
  const node = ctx.createConvolver();
  node.buffer = _buffer;
  return node;
}

function getIRSample(decay: Seconds, samplerate: number, target = 0.0): Float32Array {
  const nr_samples = samplerate * decay;
  const noise = getPinkNoiseSample(nr_samples);
  const sample_buffer = new Float32Array(nr_samples);
  const timeconstant = decay * samplerate;
  const treshold = 0.001;
  const coeff = Math.pow(1.0 / treshold, -1.0 / timeconstant);
  let state = 1.0 - target;
  for (let i = 0; i < nr_samples; i++) {
    let sample = noise[i];
    state = coeff * state + (1.0 - coeff) * target;
    sample = sample * state;
    sample_buffer[i] = sample;
  }
  return sample_buffer;
}
