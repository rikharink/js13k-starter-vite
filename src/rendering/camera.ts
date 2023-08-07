import { Matrix4x4, create, lookAt, multiply, ortho, rotateZ, scale, translation } from '../math/matrix4x4';
import { Vector2, add } from '../math/vector2';
import { Settings } from '../settings';
import { Radian } from '../types';

export class Camera {
  private projection!: Matrix4x4;
  private view!: Matrix4x4;
  private dummy: Matrix4x4 = create();

  private translate: Vector2 = [0, 0];

  private rotation: Radian = 0;

  private scale: number = 1;
  private scaleOrigin: Vector2;

  public projectionViewMatrix: Matrix4x4;

  constructor(private size: Vector2) {
    this.projectionViewMatrix = create();
    this.scaleOrigin = [this.size[0] * 0.5, this.size[1] * 0.5];
  }

  public update() {
    this.projection = ortho(create(), 0, this.size[0], this.size[1], 0, -1, 1);
    this.view = lookAt(create(), [0, 0, 1], [0, 0, 0], [0, 1, 0]);

    // Translate
    multiply(this.view, this.view, translation(this.dummy, [...this.translate, 0]));


    //Rotate
    //TODO
  
    //Scale
    multiply(this.view, this.view, translation(this.dummy, [...this.scaleOrigin, 1]));
    scale(this.view, this.view, [this.scale, this.scale, 1]);
    multiply(this.view, this.view, translation(this.dummy, [-this.scaleOrigin[0], -this.scaleOrigin[1], 1]));

    multiply(this.projectionViewMatrix, this.projection, this.view);
  }

  public move(direction: Vector2) {
    add(this.translate, this.translate, direction);
  }

  public zoom(amount: number, origin: Vector2) {
    this.scale = amount;
    this.scaleOrigin = origin;
  }
}
