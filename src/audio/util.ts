import { Tone, Frequency, Note, Octave, Mode, Chord } from './types';

export function loadAudioWorklet(ctx: AudioContext, source: string): void {
  ctx.audioWorklet.addModule(URL.createObjectURL(new Blob([source], { type: 'text/javascript' })));
}

export function getWhiteNoiseSample(nr_samples: number): Float32Array {
  const output = new Float32Array(nr_samples);
  for (let i = 0; i < nr_samples; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  return output;
}

export function getPinkNoiseSample(nr_samples: number): Float32Array {
  const output = getWhiteNoiseSample(nr_samples);
  let b0 = output[0] * 0.0555179;
  let b1 = output[0] * 0.0750759;
  let b2 = output[0] * 0.153852;
  let b3 = output[0] * 0.3104856;
  let b4 = output[0] * 0.5329522;
  let b5 = -output[0] * 0.016898;
  let b6 = output[0] * 0.115926;
  for (let i = 1; i < nr_samples; i++) {
    const white = output[i];
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.969 * b2 + white * 0.153852;
    b3 = 0.8665 * b3 + white * 0.3104856;
    b4 = 0.55 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.016898;
    output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
    b6 = white * 0.115926;
  }
  return output;
}

let _whiteNoiseBuffer: AudioBuffer | undefined;
export function whiteNoise(ctx: AudioContext): AudioBufferSourceNode {
  const bufferSize = 2 * ctx.sampleRate;
  if (!_whiteNoiseBuffer || _whiteNoiseBuffer.length !== bufferSize) {
    _whiteNoiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    _whiteNoiseBuffer.copyToChannel(getWhiteNoiseSample(bufferSize), 0);
  }
  const whiteNoise = ctx.createBufferSource();
  whiteNoise.buffer = _whiteNoiseBuffer;
  whiteNoise.loop = true;
  return whiteNoise;
}

let _pinkNoiseBuffer: AudioBuffer | undefined;
export function pinkNoise(ctx: AudioContext): AudioBufferSourceNode {
  const bufferSize = 2 * ctx.sampleRate;
  if (!_pinkNoiseBuffer || _pinkNoiseBuffer.length !== bufferSize) {
    _pinkNoiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    _pinkNoiseBuffer.copyToChannel(getPinkNoiseSample(bufferSize), 0);
  }
  const pinkNoise = ctx.createBufferSource();
  pinkNoise.buffer = _pinkNoiseBuffer;
  pinkNoise.loop = true;
  return pinkNoise;
}

export function noteToFrequency(note: Tone): Frequency {
  return 440 * Math.pow(2.0, ((note.octave - 4) * 12 + note.note) / 12.0);
}

export function addSemitones(note: Tone, semitones: number): Tone {
  let n = note.note + semitones;
  let o = note.octave;
  while (n < 0) {
    n = 12 - n;
    o--;
  }
  while (n >= 12) {
    n -= 12;
    o++;
  }
  return {
    note: n as Note,
    octave: o as Octave,
  };
}

export function getTriad(note: Tone, mode: Mode): Chord {
  const chord: Chord = [];
  chord.push(note);
  chord.push(addSemitones(note, mode === Mode.Minor ? 3 : 4));
  chord.push(addSemitones(note, 7));
  return chord;
}

export function chordToFrequencies(chord: Chord): Frequency[] {
  return chord.map(noteToFrequency);
}

export function makeDistortionCurve(amount = 20): Float32Array {
  const n_samples = 256,
    curve = new Float32Array(n_samples);
  for (let i = 0; i < n_samples; ++i) {
    const x = (i * 2) / n_samples - 1;
    curve[i] = ((Math.PI + amount) * x) / (Math.PI + amount * Math.abs(x));
  }
  return curve;
}

function reduceAudioPeak(data: Float32Array, spp: number, width: number, resolution: number): [number, number][] {
  const drawData: [number, number][] = new Array(width);
  const skip = Math.ceil(spp / resolution);

  // For each pixel in draw area
  for (let i = 0; i < width; i++) {
    let min = 0; // minimum value in sample range
    let max = 0; // maximum value in sample range
    const pixelStartSample = i * spp;

    // Iterate over the sample range for this pixel (spp)
    // and find the min and max values.
    for (let j = 0; j < spp; j += skip) {
      const index = pixelStartSample + j;
      if (index < data.length) {
        const val = data[index];
        if (val > max) {
          max = val;
        } else if (val < min) {
          min = val;
        }
      }
    }

    drawData[i] = [min, max];
  }
  return drawData;
}

export function waveformToImage(
  waveform: Float32Array,
  width: number,
  height: number,
  spp: number,
  resolution: number
): HTMLImageElement {
  const drawData = reduceAudioPeak(waveform, spp, width, resolution);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const ctx = canvas.getContext('2d')!;
  const drawHeight = height / 2;

  // clear canvas incase there is already something drawn
  ctx.clearRect(0, 0, width, height);
  for (let i = 0; i < width; i++) {
    // transform data points to pixel height and move to centre
    const minPixel = drawData[i][0] * drawHeight + drawHeight;
    const maxPixel = drawData[i][1] * drawHeight + drawHeight;
    const pixelHeight = maxPixel - minPixel;
    ctx.fillRect(i, minPixel, 1, pixelHeight);
  }
  const src = canvas.toDataURL();
  const img = new Image();
  img.src = src;
  return img;
}

export function lowpass(input: Float32Array, a: number): Float32Array {
  let previous = a * input[0];
  const output = new Float32Array(input.length);
  for (let i = 1; i < input.length; i++) {
    previous = output[i] = a * input[i] + (1 - a) * previous;
  }
  return output;
}

export function highpass(input: Float32Array, a: number): Float32Array {
  let previous = a * input[0];
  const output = new Float32Array(input.length);
  for (let i = 1; i < input.length; i++) {
    previous = output[i] = a * (previous + input[i] - input[i - 1]);
  }
  return output;
}
