export const enum Note {
  A = 0,
  As = 1,
  Bf = 1,
  B = 2,
  C = 3,
  Cs = 4,
  Df = 4,
  D = 5,
  Ds = 6,
  E = 7,
  F = 8,
  Fs = 9,
  Gf = 9,
  G = 10,
  Gs = 11,
  Af = 11,
}

export type Octave = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type Tone = { note: Note; octave: Octave };
export type Chord = Tone[];

export const enum Mode {
  Major = 0,
  Minor = 1,
}

export type Frequency = number;
