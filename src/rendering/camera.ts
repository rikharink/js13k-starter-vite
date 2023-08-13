import { AABB } from '../math/geometry/aabb';
import { Matrix4x4, create, fromRotationTranslationScaleOrigin, lookAt, multiply, ortho } from '../math/matrix4x4';
import { Noise2D, makeNoise2D } from '../math/noise/2d';
import { Quaternion, from_axis } from '../math/quaternion';
import { Vector2, add, mul, scale, subtract } from '../math/vector2';
import { Settings } from '../settings';
import { Milliseconds, Radian } from '../types';

export class Camera {
  public translation: Vector2 = [0, 0];
  public rotation: Radian = 0;
  public scale: number = 1;
  public origin: Vector2;
  public wantedOrigin: Vector2;
  public followSpeed: Vector2 = [1, 1];

  private projection!: Matrix4x4;
  private view!: Matrix4x4;
  private m: Matrix4x4 = create();
  private q: Quaternion = [0, 0, 0, 0];

  private noise: Noise2D;

  public projectionViewMatrix: Matrix4x4;

  constructor(private size: Vector2) {
    this.projectionViewMatrix = create();
    this.origin = this.center;
    this.wantedOrigin = [...this.origin];
    this.noise = makeNoise2D(Settings.seed);
  }

  public get viewport(): AABB {
    return {
      min: [this.translation[0], this.translation[1]],
      max: [this.translation[0] + this.size[0] / this.scale, this.translation[1] + this.size[1] / this.scale],
    };
  }

  public get center(): Vector2 {
    return [(this.viewport.max[0] - this.viewport.min[0]) * 0.5, (this.viewport.max[1] - this.viewport.min[1]) * 0.5];
  }

  private cameraShake(shake: number, t: Milliseconds) {
    const rotationalShake = Settings.maxRotationalShake * shake * this.scale * this.noise(Settings.seed, t);
    const translationalShake: Vector2 = [
      Settings.maxTranslationalShake * shake * this.scale * this.noise(Settings.seed + 1, t),
      Settings.maxTranslationalShake * shake * this.scale * this.noise(Settings.seed + 2, t),
    ];
    multiply(
      this.view,
      this.view,
      fromRotationTranslationScaleOrigin(
        this.m,
        from_axis(this.q, [0, 0, 1], rotationalShake),
        [...translationalShake, 0],
        [1, 1, 1],
        [...this.center, 1],
      ),
    );
  }

  public update(t: Milliseconds, shake: number) {
    const wanted: Vector2 = [...this.wantedOrigin];
    subtract(wanted, wanted, this.center);
    scale(wanted, wanted, -1);

    //FIX ME: instant follow is broken
    add(
      this.translation,
      this.translation,
      mul([0, 0], subtract([0, 0], wanted, this.translation), scale([0, 0], this.followSpeed, Settings.timeScale)),
    );

    this.projection = ortho(create(), 0, this.size[0], this.size[1], 0, -1, 1);
    this.view = lookAt(create(), [0, 0, 1], [0, 0, 0], [0, 1, 0]);
    this.cameraShake(shake, t);
    multiply(
      this.view,
      this.view,
      fromRotationTranslationScaleOrigin(
        this.m,
        from_axis(this.q, [0, 0, 1], this.rotation),
        [...this.translation, 0],
        [this.scale, this.scale, 1],
        [...this.origin, 0],
      ),
    );

    multiply(this.projectionViewMatrix, this.projection, this.view);
  }
}
