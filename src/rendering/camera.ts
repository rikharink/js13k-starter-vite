import { Matrix4x4, create, fromRotationTranslationScaleOrigin, lookAt, multiply, ortho } from '../math/matrix4x4';
import { Noise2D, makeNoise2D } from '../math/noise/2d';
import { Quaternion, from_axis } from '../math/quaternion';
import { Vector2, add } from '../math/vector2';
import { Settings } from '../settings';
import { Milliseconds, Radian } from '../types';
import { Rectangle } from './sprite';

export class Camera {
  public translation: Vector2 = [0, 0];
  public rotation: Radian = 0;
  public scale: number = 1;

  private origin: Vector2;
  private projection!: Matrix4x4;
  private view!: Matrix4x4;
  private m: Matrix4x4 = create();
  private q: Quaternion = [0, 0, 0, 0];

  private noise: Noise2D;

  public projectionViewMatrix: Matrix4x4;

  constructor(private size: Vector2) {
    this.projectionViewMatrix = create();
    this.origin = [this.size[0] * 0.5, this.size[1] * 0.5];

    this.noise = makeNoise2D(Settings.seed);
  }

  public get viewport(): Rectangle {
    return {
      position: this.translation,
      size: [this.size[0] / this.scale, this.size[1] / this.scale],
    };
  }

  public update(t: Milliseconds, shake: number) {
    this.projection = ortho(create(), 0, this.size[0], this.size[1], 0, -1, 1);
    this.view = lookAt(create(), [0, 0, 1], [0, 0, 0], [0, 1, 0]);

    const rotationalShake = Settings.maxRotationalShake * shake * this.noise(Settings.seed, t);
    const translationalShake: Vector2 = [
      Settings.maxTranslationalShake * shake * this.noise(Settings.seed + 1, t),
      Settings.maxTranslationalShake * shake * this.noise(Settings.seed + 2, t),
    ];
    let rotation = this.rotation;
    rotation += rotationalShake;
    const translation: Vector2 = [...this.translation];
    add(translation, translation, translationalShake);

    multiply(
      this.view,
      this.view,
      fromRotationTranslationScaleOrigin(
        this.m,
        from_axis(this.q, [0, 0, 1], rotation),
        [...translation, 0],
        [this.scale, this.scale, 1],
        [...this.origin, 0],
      ),
    );

    multiply(this.projectionViewMatrix, this.projection, this.view);
  }
}
