import { TAU } from './math/const';

export const Settings = {
  resolution: [1280, 800],
  fixedDeltaTime: 1000 / 30,
  minLoadingTimeMs: 100,
  clearColor: [0.1, 0.37, 0.71],
  maxRotationalShake: TAU * 0.1,
  maxTranslationalShake: 25,
  seed: 1337,
  followCam: false,
  timeScale: 1,
};
